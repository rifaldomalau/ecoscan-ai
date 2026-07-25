import {
  ClipboardList,
  Clock3,
  Home,
  Leaf,
  Recycle,
  ScanLine,
  Settings,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

export default function DashboardPage() {
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
                <AvatarFallback>U</AvatarFallback>
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
          <section className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Scans</CardTitle>
                <CardDescription>Placeholder metric</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">--</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Eco Score</CardTitle>
                <CardDescription>Placeholder progress</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">--</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Current Level</CardTitle>
                <CardDescription>Placeholder level</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">--</p>
              </CardContent>
            </Card>
          </section>

          <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_22rem]">
            <Card>
              <CardHeader>
                <CardTitle>Scan Activity</CardTitle>
                <CardDescription>
                  Recent scan summaries will appear here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed bg-background text-sm text-muted-foreground">
                  Placeholder content
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Waste Categories</CardTitle>
                <CardDescription>
                  Category breakdown will be added later.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Organic", "Plastic", "Paper", "Electronic"].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-lg border bg-background px-3 py-2"
                  >
                    <span className="text-sm font-medium">{item}</span>
                    <span className="text-sm text-muted-foreground">--</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="size-4" aria-hidden="true" />
                  Next Steps
                </CardTitle>
                <CardDescription>
                  Scan actions and saved history will be added later.
                </CardDescription>
              </CardHeader>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
