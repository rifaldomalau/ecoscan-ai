import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { analyzeWaste } from "@/lib/ai/waste-analysis";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");
    const itemName = formData.get("itemName");

    const result = await analyzeWaste({
      image: image instanceof File ? image : undefined,
      itemName: typeof itemName === "string" ? itemName : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "AI response did not match the expected format." },
        { status: 502 },
      );
    }

    const message = error instanceof Error ? error.message : "Unable to analyze waste.";
    const status = message.startsWith("Provide") || message.startsWith("Unsupported") || message.startsWith("Image") ? 400 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
