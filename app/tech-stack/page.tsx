import {
  ArrowDown,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Database,
  Globe,
  History,
  ImageIcon,
  Layers,
  LayoutDashboard,
  Recycle,
  ScanLine,
  Server,
  ShieldCheck,
  Trophy,
  Type,
  Zap,
} from "lucide-react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const techSections = [
  {
    id: "ai",
    title: "AI",
    description: "Powered by Google's latest multimodal model.",
    icon: BrainCircuit,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    items: [
      { label: "Google Gemini 3.6 Flash", icon: Bot, badge: "Active" },
      { label: "Image Analysis", icon: ImageIcon },
      { label: "Text Analysis", icon: Type },
      { label: "Waste Classification", icon: Recycle },
      { label: "Recycling Recommendation", icon: CheckCircle2 },
    ],
  },
  {
    id: "frontend",
    title: "Frontend",
    description: "Modern React stack with full type safety.",
    icon: Globe,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    items: [
      { label: "Next.js 16", icon: Zap, badge: "App Router" },
      { label: "React 19", icon: Layers },
      { label: "TypeScript", icon: ShieldCheck },
      { label: "Tailwind CSS", icon: Globe },
      { label: "shadcn/ui", icon: Layers },
      { label: "Lucide Icons", icon: CheckCircle2 },
    ],
  },
  {
    id: "backend",
    title: "Backend",
    description: "Serverless handlers running at the edge.",
    icon: Server,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    items: [
      { label: "Next.js Route Handlers", icon: Server },
      { label: "Server Actions", icon: Zap },
      { label: "Zod Validation", icon: ShieldCheck },
    ],
  },
  {
    id: "database",
    title: "Database & Auth",
    description: "Persistent storage with row-level security.",
    icon: Database,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    items: [
      { label: "Supabase PostgreSQL", icon: Database, badge: "Primary DB" },
      { label: "Supabase Auth", icon: ShieldCheck },
      { label: "Row Level Security (RLS)", icon: ShieldCheck },
    ],
  },
  {
    id: "features",
    title: "Application Features",
    description: "Core capabilities available to every user.",
    icon: LayoutDashboard,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    items: [
      { label: "AI Waste Scan", icon: ScanLine },
      { label: "Manual Waste Analysis", icon: Type },
      { label: "Scan History", icon: History },
      { label: "Eco Score", icon: Trophy },
      { label: "Dashboard Analytics", icon: LayoutDashboard },
    ],
  },
] as const;

const architectureSteps = [
  { label: "User", icon: Globe, description: "Browser / mobile client" },
  { label: "Next.js", icon: Zap, description: "Server components + API routes" },
  { label: "API Route", icon: Server, description: "/api/analyze handler" },
  { label: "Gemini AI", icon: BrainCircuit, description: "gemini-3.6-flash model" },
  { label: "Supabase", icon: Database, description: "PostgreSQL + Auth" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function TechStackPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const avatarFallback = user.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <AppShell
      avatarFallback={avatarFallback}
      eyebrow="About"
      title="Tech Stack"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        {/* Intro */}
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          EcoScan AI is built on a modern, type-safe full-stack architecture
          designed to be fast, secure, and easy to extend.
        </p>

        {/* Tech sections grid */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {techSections.map((section) => {
            const SectionIcon = section.icon;

            return (
              <Card key={section.id} className="flex flex-col">
                <CardHeader className="flex-row items-start gap-3 pb-3">
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${section.bg} ${section.color}`}
                  >
                    <SectionIcon className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base">{section.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {section.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-1.5">
                  {section.items.map((item) => {
                    const ItemIcon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="flex items-center gap-2.5 rounded-lg border bg-background px-3 py-2"
                      >
                        <ItemIcon
                          className="size-3.5 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">
                          {item.label}
                        </span>
                        {"badge" in item && item.badge ? (
                          <Badge variant="secondary" className="shrink-0">
                            {item.badge}
                          </Badge>
                        ) : null}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* Architecture flow */}
        <Card>
          <CardHeader>
            <CardTitle>Architecture Flow</CardTitle>
            <CardDescription>
              How a waste analysis request travels through the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-0 sm:flex-row sm:items-start sm:gap-0">
              {architectureSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isLast = index === architectureSteps.length - 1;

                return (
                  <div
                    key={step.label}
                    className="flex flex-col items-center sm:flex-1"
                  >
                    {/* Node */}
                    <div className="flex flex-col items-center gap-2 px-2 py-3 text-center">
                      <div className="flex size-12 items-center justify-center rounded-xl border bg-muted text-muted-foreground">
                        <StepIcon className="size-5" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{step.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Connector — vertical on mobile, horizontal on sm+ */}
                    {!isLast && (
                      <div className="flex items-center justify-center sm:hidden">
                        <ArrowDown
                          className="size-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Horizontal connector row — visible sm+ only, rendered as a
                visual line between the nodes above */}
            <div className="mt-2 hidden items-center justify-between px-8 sm:flex">
              {architectureSteps.slice(0, -1).map((step) => (
                <div
                  key={`connector-${step.label}`}
                  className="flex flex-1 items-center justify-center"
                >
                  <div className="h-px w-full bg-border" />
                  <ArrowDown
                    className="size-3.5 shrink-0 -rotate-90 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
