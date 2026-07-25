import OpenAI from "openai";
import { z } from "zod";

const maxImageSize = 5 * 1024 * 1024;
const supportedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

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

function createOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

async function fileToDataUrl(file: File) {
  if (!supportedImageTypes.has(file.type)) {
    throw new Error("Unsupported image type. Use JPG, PNG, or WEBP.");
  }

  if (file.size > maxImageSize) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

export async function analyzeWaste(input: AnalyzeWasteInput) {
  const itemName = input.itemName?.trim();
  const hasImage = Boolean(input.image && input.image.size > 0);

  if (!hasImage && !itemName) {
    throw new Error("Provide an uploaded image or an item name.");
  }

  const content: Array<
    | { type: "input_text"; text: string }
    | { type: "input_image"; image_url: string; detail: "auto" }
  > = [
    {
      type: "input_text",
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
    content.push({
      type: "input_image",
      image_url: await fileToDataUrl(input.image),
      detail: "auto",
    });
  }

  const response = await createOpenAIClient().responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    input: [
      {
        role: "developer",
        content:
          "You classify waste items and must respond only with valid JSON matching the provided schema.",
      },
      {
        role: "user",
        content,
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "waste_analysis",
        strict: true,
        schema: wasteAnalysisJsonSchema,
      },
    },
  });

  const parsedJson = JSON.parse(response.output_text);
  return wasteAnalysisSchema.parse(parsedJson);
}
