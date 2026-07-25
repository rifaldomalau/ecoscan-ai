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

const maxImageSize = 5 * 1024 * 1024;

export default function ScanPage() {
  const [imageName, setImageName] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setError("");
    setStatus("");

    if (!file) {
      setImageName("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      event.target.value = "";
      setImageName("");
      setError("Please upload an image file.");
      return;
    }

    if (file.size > maxImageSize) {
      event.target.value = "";
      setImageName("");
      setError("Image must be 5 MB or smaller.");
      return;
    }

    setImageName(file.name);
  }

  function handleManualInputChange(value: string) {
    setManualInput(value);
    setError("");
    setStatus("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const hasImage = imageName.length > 0;
    const hasManualInput = manualInput.trim().length > 0;

    if (!hasImage && !hasManualInput) {
      setError("Upload an image or describe the waste item first.");
      return;
    }

    setError("");
    setStatus("");
    setIsLoading(true);

    window.setTimeout(() => {
      setIsLoading(false);
      setStatus("Placeholder analysis is ready for the next integration step.");
    }, 900);
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
            Upload a waste image or enter the item name manually to prepare an
            analysis request.
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
                          <p className="text-sm font-medium">
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
                        accept="image/*"
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

                {status ? (
                  <p className="text-sm text-muted-foreground" role="status">
                    {status}
                  </p>
                ) : null}

                <Button type="submit" className="w-full sm:w-fit" disabled={isLoading}>
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
                Placeholder preview before AI integration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-lg border bg-background p-3">
                <p className="font-medium">Selected image</p>
                <p className="mt-1 text-muted-foreground">
                  {imageName || "No image selected"}
                </p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="font-medium">Manual input</p>
                <p className="mt-1 text-muted-foreground">
                  {manualInput.trim() || "No description entered"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
