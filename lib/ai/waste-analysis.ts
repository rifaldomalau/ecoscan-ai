import { ApiError, GoogleGenAI, type Part } from "@google/genai";
import fs from "fs";
import path from "path";
import { z } from "zod";

// ---------------------------------------------------------------------------
// SDK version – resolved at server startup from the installed package.json.
// This runs only in the Node.js runtime (API routes), not in the browser.
// ---------------------------------------------------------------------------
function readSdkVersion(): string {
  try {
    const pkgPath = path.join(
      path.dirname(require.resolve("@google/genai")),
      "..",
      "package.json",
    );
    const raw = fs.readFileSync(pkgPath, "utf8");
    return (JSON.parse(raw) as { version?: string }).version ?? "unknown";
  } catch {
    return "unknown";
  }
}

const SDK_VERSION = readSdkVersion();

const DEFAULT_MODEL = "gemini-2.5-flash";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

// ---------------------------------------------------------------------------
// Zod schema (unchanged)
// ---------------------------------------------------------------------------

const wasteAnalysisSchema = z.object({
  itemName: z.string().min(1),
  category: z.string().min(1),
  recyclable: z.boolean(),
  disposalMethod: z.string().min(1),
  environmentalImpact: z.string().min(1),
  reuseIdeas: z.array(z.string().min(1)),
  confidence: z.number().int().min(0).max(100),
});

const wasteAnalysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    itemName: {
      type: "string",
      description: "The identified waste item name.",
    },
    category: {
      type: "string",
      description:
        "Waste category, such as plastic, paper, organic, metal, glass, electronic, hazardous, or other.",
    },
    recyclable: {
      type: "boolean",
      description: "Whether the item is generally recyclable.",
    },
    disposalMethod: {
      type: "string",
      description: "Clear disposal guidance for the item.",
    },
    environmentalImpact: {
      type: "string",
      description: "A short explanation of the environmental impact.",
    },
    reuseIdeas: {
      type: "array",
      description: "Practical reuse ideas for the item.",
      items: {
        type: "string",
      },
    },
    confidence: {
      type: "integer",
      description: "Confidence score from 0 to 100.",
    },
  },
  required: [
    "itemName",
    "category",
    "recyclable",
    "disposalMethod",
    "environmentalImpact",
    "reuseIdeas",
    "confidence",
  ],
} as const;

export type WasteAnalysis = z.infer<typeof wasteAnalysisSchema>;

export type AnalyzeWasteInput = {
  image?: File;
  itemName?: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getModel(): string {
  return process.env.AI_MODEL?.trim() || DEFAULT_MODEL;
}

function createGeminiClient() {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("AI analysis is not configured. Please contact support.");
  }

  return new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
  });
}

/**
 * Translate raw SDK/API errors into user-facing messages while logging the
 * full API error response for debugging.
 */
function toGeminiError(error: unknown, model: string): Error {
  if (error instanceof ApiError) {
    // Log the full API error so operators can diagnose issues server-side.
    console.error("[Gemini] API error response", {
      model,
      sdkVersion: SDK_VERSION,
      status: error.status,
      message: error.message,
    });

    const lower = error.message.toLowerCase();

    if (
      error.status === 401 ||
      error.status === 403 ||
      lower.includes("api key not valid") ||
      lower.includes("invalid api key") ||
      lower.includes("permission denied")
    ) {
      return new Error("Invalid Google API key. Check GOOGLE_API_KEY and try again.");
    }

    if (
      error.status === 429 ||
      lower.includes("quota") ||
      lower.includes("resource_exhausted") ||
      lower.includes("rate limit")
    ) {
      return new Error("Gemini quota exceeded. Please wait and try again.");
    }

    if (
      error.status === 404 ||
      (lower.includes("model") && lower.includes("not found"))
    ) {
      return new Error(
        `Gemini model "${model}" is not available. ` +
          `Verify AI_MODEL is set to a supported model name (e.g. gemini-2.5-flash).`,
      );
    }

    // Any other ApiError: surface the raw message.
    return new Error(error.message || "Unable to analyze waste.");
  }

  // Non-API errors (network timeout, our own validation errors, etc.)
  if (error instanceof Error) {
    return error;
  }

  return new Error("Unable to analyze waste.");
}

async function fileToGenerativePart(file: File): Promise<Part> {
  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Unsupported image type. Use JPG, PNG, or WEBP.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType: file.type,
    },
  };
}

function parseGeminiJson(responseText: string) {
  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error("Gemini returned invalid JSON.");
  }
}

// ---------------------------------------------------------------------------
// Public API (signature unchanged)
// ---------------------------------------------------------------------------

export async function analyzeWaste(input: AnalyzeWasteInput): Promise<WasteAnalysis> {
  const itemName = input.itemName?.trim();
  const hasImage = Boolean(input.image && input.image.size > 0);

  if (!hasImage && !itemName) {
    throw new Error("Provide an uploaded image or an item name.");
  }

  const model = getModel();
  const startedAt = Date.now();

  // Log configuration on every request so operators can verify what is active.
  console.info("[Gemini] Starting analysis", {
    model,
    sdkVersion: SDK_VERSION,
    hasImage,
    hasItemName: Boolean(itemName),
  });

  const contents: Part[] = [
    {
      text: [
        "Analyze the waste item for an environmental education app.",
        "Return practical disposal guidance for a general user in Indonesia.",
        itemName
          ? `User-provided item name: ${itemName}`
          : "No item name was provided.",
      ].join("\n"),
    },
  ];

  if (input.image && input.image.size > 0) {
    contents.push(await fileToGenerativePart(input.image));
  }

  try {
    const response = await createGeminiClient().models.generateContent({
      model,
      contents,
      config: {
        systemInstruction:
          "You classify waste items and must respond only with valid JSON matching the provided schema.",
        responseMimeType: "application/json",
        responseJsonSchema: wasteAnalysisJsonSchema,
      },
    });

    const responseText = response.text;

    if (!responseText) {
      throw new Error("Gemini returned an empty analysis response.");
    }

    const parsedJson = parseGeminiJson(responseText);
    return wasteAnalysisSchema.parse(parsedJson);
  } catch (error) {
    throw toGeminiError(error, model);
  } finally {
    console.info("[Gemini] Analysis request completed", {
      model,
      sdkVersion: SDK_VERSION,
      hasImage,
      durationMs: Date.now() - startedAt,
    });
  }
}
