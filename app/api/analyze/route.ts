import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { analyzeWaste } from "@/lib/ai/waste-analysis";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const scanHistoryInsertSchema = z.object({
  user_id: z.string().uuid(),
  item_name: z.string().min(1),
  category: z.string().min(1),
  recyclable: z.boolean(),
  disposal_method: z.string().min(1),
  environmental_impact: z.string().min(1),
  reuse_ideas: z.string().min(1),
  confidence: z.number().int().min(0).max(100),
  created_at: z.string().datetime(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "You must be logged in to analyze waste." },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const image = formData.get("image");
    const itemName = formData.get("itemName");

    const result = await analyzeWaste({
      image: image instanceof File ? image : undefined,
      itemName: typeof itemName === "string" ? itemName : undefined,
    });

    const scanHistoryRow = scanHistoryInsertSchema.parse({
      user_id: user.id,
      item_name: result.itemName,
      category: result.category,
      recyclable: result.recyclable,
      disposal_method: result.disposalMethod,
      environmental_impact: result.environmentalImpact,
      reuse_ideas: JSON.stringify(result.reuseIdeas),
      confidence: result.confidence,
      created_at: new Date().toISOString(),
    });

    const { error: insertError } = await supabase
      .from("scan_history")
      .insert(scanHistoryRow);

    if (insertError) {
      return NextResponse.json(
        { error: "Analysis completed, but saving the scan history failed." },
        { status: 500 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Analysis result could not be saved because it was invalid." },
        { status: 502 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Unable to analyze waste.";
    const status =
      message.startsWith("Provide") ||
      message.startsWith("Unsupported") ||
      message.startsWith("Image")
        ? 400
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
