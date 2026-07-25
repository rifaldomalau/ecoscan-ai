import { redirect } from "next/navigation";
import { AlertCircle, Leaf } from "lucide-react";

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
import { createClient } from "@/lib/supabase/server";

import { signIn } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const { error } = await searchParams;
  const hasError = error === "invalid-credentials";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50/50 p-4 dark:bg-zinc-950">
      <Card className="w-full max-w-sm shadow-lg border-border/60">
        <CardHeader className="space-y-1.5 text-center">
          {/* Logo / Icon Branding */}
          <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Leaf className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            EcoScan AI
          </CardTitle>
          <CardDescription className="text-xs">
            Masuk ke akun Anda untuk melanjutkan ke dashboard.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          {/* Demo Credentials Box */}
          <div className="rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">
              Demo Credentials:
            </p>
            <div className="flex flex-col gap-0.5">
              <p>
                Email:{" "}
                <code className="rounded bg-background px-1.5 py-0.5 font-mono font-medium text-foreground border">
                  user@test.com
                </code>
              </p>
              <p>
                Password:{" "}
                <code className="rounded bg-background px-1.5 py-0.5 font-mono font-medium text-foreground border">
                  user
                </code>
              </p>
            </div>
          </div>

          {/* Error Message */}
          {hasError && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Email atau password salah. Silakan coba lagi.</span>
            </div>
          )}

          {/* Form */}
          <form action={signIn} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="w-full mt-1 font-medium">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
