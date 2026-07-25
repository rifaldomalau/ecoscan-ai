import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  Home,
  Leaf,
  Recycle,
  ScanLine,
  Settings,
  Trophy,
} from "lucide-react";
import { redirect } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

const navigationItems = [
  {
    label: "Overview",
    icon: Home,
    active: true,
  },
  {
    label: "Scan Waste",
    icon: ScanLine,
    active: false,
  },
  {
    label: "History",
    icon: Clock3,
    active: false,
  },
  {
    label: "Eco Score",
    icon: Leaf,
    active: false,
  },
];

type ScanHistoryRecord = {
  item_name: string;
  category: string;
  recyclable: boolean;
  created_at: string;
};

function getEcoLevel(score: number) {
  if (score > 100) {
    return "Earth Guardian";
  }

  if (score > 50) {
    return "Eco Hero";
  }

  if (score > 20) {
    return "Eco Explorer";
  }

  return "Beginner";
}

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

  const { data, error } = await supabase
    .from("scan_history")
    .select("item_name,category,recyclable,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load dashboard statistics.");
  }

  const scans = (data ?? []) as ScanHistoryRecord[];
  const totalScans = scans.length;
  const recyclableItems = scans.filter((scan) => scan.recyclable).length;
  const ecoScore = totalScans;
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
      description: getEcoLevel(ecoScore),
      icon: Trophy,
    },
    {
      title: "Recyclable Items",
      value: recyclableItems.toString(),
      description: hasScans ? "Marked as recyclable" : "Start scanning to track this",
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
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Recycle className="size-4" aria-hidden="true" />
          </div>
          <span className="text-base font-semibold">EcoScan AI</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {navigationItems.map((item) => (
            <Button
              key={item.label}
              variant={item.active ? "secondary" : "ghost"}
              className="h-10 justify-start gap-3 px-3"
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </Button>
          ))}
        </nav>
        <div className="border-t p-4">
          <Button variant="ghost" className="h-10 w-full justify-start gap-3 px-3">
            <Settings className="size-4" aria-hidden="true" />
            Settings
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground lg:hidden">
                <Recycle className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Dashboard</p>
                <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
                  Waste Overview
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button className="hidden sm:inline-flex">
                <ScanLine className="size-4" aria-hidden="true" />
                New Scan
              </Button>
              <Avatar>
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-4 pb-3 sm:px-6 lg:hidden">
            {navigationItems.map((item) => (
              <Button
                key={item.label}
                variant={item.active ? "secondary" : "ghost"}
                size="sm"
                className="shrink-0 gap-2"
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </Button>
            ))}
          </nav>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
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

          <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_22rem]">
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
                      <Badge className="mt-1" variant={lastScan.recyclable ? "secondary" : "outline"}>
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
                    No category data yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
