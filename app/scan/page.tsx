"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";
import { ImageUp, Loader2, ScanLine, Type } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { WasteAnalysis } from "@/lib/ai/waste-analysis";

const maxImageSize = 5 * 1024 * 1024;

type AnalyzeErrorResponse = {
  error?: string;
};

export default function ScanPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<WasteAnalysis | null>(null);

  const imageName = selectedImage?.name || "";

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setError("");
    setAnalysis(null);

    if (!file) {
      setSelectedImage(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      event.target.value = "";
      setSelectedImage(null);
      setError("Please upload an image file.");
      return;
    }

    if (file.size > maxImageSize) {
      event.target.value = "";
      setSelectedImage(null);
      setError("Image must be 5 MB or smaller.");
      return;
    }

    setSelectedImage(file);
  }

  function handleManualInputChange(value: string) {
    setManualInput(value);
    setError("");
    setAnalysis(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const hasImage = Boolean(selectedImage);
    const hasManualInput = manualInput.trim().length > 0;

    if (!hasImage && !hasManualInput) {
      setError("Upload an image or describe the waste item first.");
      return;
    }

    const formData = new FormData();

    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    if (hasManualInput) {
      formData.append("itemName", manualInput.trim());
    }

    setError("");
    setAnalysis(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json()) as AnalyzeErrorResponse;
        throw new Error(payload.error || "Unable to analyze waste.");
      }

      const result = (await response.json()) as WasteAnalysis;
      setAnalysis(result);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to analyze waste.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">EcoScan AI</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Scan Waste
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Upload a waste image or enter the item name manually to analyze the
            item.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <Card>
            <CardHeader>
              <CardTitle>Waste Details</CardTitle>
              <CardDescription>
                Provide at least one input before analyzing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <div className="grid gap-3">
                  <Label htmlFor="waste-image">Image upload</Label>
                  <div className="rounded-lg border border-dashed bg-background p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <ImageUp className="size-5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {imageName || "Choose an image"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, or WEBP up to 5 MB
                          </p>
                        </div>
                      </div>
                      <Input
                        id="waste-image"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="max-w-xs bg-background"
                        disabled={isLoading}
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="manual-waste">Manual text input</Label>
                  <Textarea
                    id="manual-waste"
                    value={manualInput}
                    placeholder="Example: plastic bottle, used battery, paper cup"
                    className="min-h-28 resize-none bg-background"
                    disabled={isLoading}
                    onChange={(event) =>
                      handleManualInputChange(event.target.value)
                    }
                  />
                </div>

                {error ? (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  className="w-full sm:w-fit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <ScanLine className="size-4" aria-hidden="true" />
                  )}
                  {isLoading ? "Analyzing..." : "Analyze Waste"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="size-4" aria-hidden="true" />
                Input Summary
              </CardTitle>
              <CardDescription>
                Current input prepared for analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-lg border bg-background p-3">
                <p className="font-medium">Selected image</p>
                <p className="mt-1 break-words text-muted-foreground">
                  {imageName || "No image selected"}
                </p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="font-medium">Manual input</p>
                <p className="mt-1 break-words text-muted-foreground">
                  {manualInput.trim() || "No description entered"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {analysis ? (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Result</CardTitle>
              <CardDescription>
                Validated JSON returned by the AI service.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-background p-3">
                  <dt className="text-sm font-medium">Item Name</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">
                    {analysis.itemName}
                  </dd>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <dt className="text-sm font-medium">Category</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">
                    {analysis.category}
                  </dd>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <dt className="text-sm font-medium">Recyclable</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">
                    {analysis.recyclable ? "Yes" : "No"}
                  </dd>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <dt className="text-sm font-medium">Confidence</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">
                    {analysis.confidence}%
                  </dd>
                </div>
                <div className="rounded-lg border bg-background p-3 sm:col-span-2">
                  <dt className="text-sm font-medium">Disposal Method</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">
                    {analysis.disposalMethod}
                  </dd>
                </div>
                <div className="rounded-lg border bg-background p-3 sm:col-span-2">
                  <dt className="text-sm font-medium">Environmental Impact</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">
                    {analysis.environmentalImpact}
                  </dd>
                </div>
                <div className="rounded-lg border bg-background p-3 sm:col-span-2">
                  <dt className="text-sm font-medium">Reuse Ideas</dt>
                  <dd className="mt-2">
                    <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      {analysis.reuseIdeas.map((idea) => (
                        <li key={idea}>{idea}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
