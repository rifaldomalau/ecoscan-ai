import { CheckCircle2, ClipboardList, Clock3, ScanLine, Trophy } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { calculateEcoScore, getEcoLevel } from "@/lib/eco-score";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type ScanHistoryRecord = {
  item_name: string;
  category: string;
  recyclable: boolean;
  created_at: string;
};

function formatScanDate(value?: string) {
  if (!value) {
    return "No scans yet";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getCategoryCounts(scans: ScanHistoryRecord[]) {
  return scans.reduce<Record<string, number>>((counts, scan) => {
    counts[scan.category] = (counts[scan.category] || 0) + 1;
    return counts;
  }, {});
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [scanHistoryResponse, ecoPointsResponse] = await Promise.all([
    supabase
      .from("scan_history")
      .select("item_name,category,recyclable,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("eco_points")
      .select("points,level")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (scanHistoryResponse.error || ecoPointsResponse.error) {
    throw new Error("Unable to load dashboard statistics.");
  }

  const scans = (scanHistoryResponse.data ?? []) as ScanHistoryRecord[];
  const totalScans = scans.length;
  const recyclableItems = scans.filter((scan) => scan.recyclable).length;
  const fallbackEcoScore = calculateEcoScore(totalScans);
  const ecoScore = ecoPointsResponse.data?.points ?? fallbackEcoScore;
  const ecoLevel = ecoPointsResponse.data?.level ?? getEcoLevel(ecoScore);
  const lastScan = scans[0];
  const hasScans = totalScans > 0;
  const categoryCounts = Object.entries(getCategoryCounts(scans));
  const avatarFallback = user.email?.charAt(0).toUpperCase() || "U";

  const statisticCards = [
    {
      title: "Total Scans",
      value: totalScans.toString(),
      description: hasScans ? "Waste items scanned" : "No scans recorded yet",
      icon: ClipboardList,
    },
    {
      title: "Eco Score",
      value: ecoScore.toString(),
      description: ecoLevel,
      icon: Trophy,
    },
    {
      title: "Recyclable Items",
      value: recyclableItems.toString(),
      description: hasScans
        ? "Marked as recyclable"
        : "Start scanning to track this",
      icon: CheckCircle2,
    },
    {
      title: "Last Scan",
      value: lastScan?.item_name || "None",
      description: formatScanDate(lastScan?.created_at),
      icon: Clock3,
    },
  ];

  return (
    <AppShell
      avatarFallback={avatarFallback}
      eyebrow="Dashboard"
      title="Waste Overview"
      action={
        <Link href="/scan" className={cn(buttonVariants(), "hidden sm:inline-flex")}>
          <ScanLine className="size-4" aria-hidden="true" />
          New Scan
        </Link>
      }
    >
      <div className="flex flex-col gap-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statisticCards.map((statistic) => (
            <Card key={statistic.title}>
              <CardHeader className="flex-row items-start justify-between gap-3">
                <div className="grid min-w-0 gap-1">
                  <CardDescription>{statistic.title}</CardDescription>
                  <CardTitle className="truncate text-3xl font-semibold">
                    {statistic.value}
                  </CardTitle>
                </div>
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <statistic.icon className="size-4" aria-hidden="true" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {statistic.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_22rem]">
          <Card>
            <CardHeader>
              <CardTitle>Scan Activity</CardTitle>
              <CardDescription>
                {hasScans
                  ? "Your most recent scan summary."
                  : "Your scan activity will appear here."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lastScan ? (
                <div className="grid gap-3 rounded-lg border bg-background p-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground">Item Name</p>
                    <p className="mt-1 font-medium">{lastScan.item_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="mt-1 font-medium">{lastScan.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Recyclable</p>
                    <Badge
                      className="mt-1"
                      variant={lastScan.recyclable ? "secondary" : "outline"}
                    >
                      {lastScan.recyclable ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Scan Date</p>
                    <p className="mt-1 font-medium">
                      {formatScanDate(lastScan.created_at)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed bg-background px-4 text-center text-sm text-muted-foreground">
                  Analyze your first waste item to populate the dashboard.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Waste Categories</CardTitle>
              <CardDescription>
                {hasScans
                  ? "Categories from your saved scans."
                  : "Categories will appear after your first scan."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {categoryCounts.length > 0 ? (
                categoryCounts.map(([category, count]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between rounded-lg border bg-background px-3 py-2"
                  >
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed bg-background px-3 py-8 text-center text-sm text-muted-foreground">
                  Analyze an item to see category totals.
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
