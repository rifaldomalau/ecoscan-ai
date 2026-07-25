import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { HistoryList, type ScanHistoryItem } from "./history-list";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("scan_history")
    .select("id,item_name,category,recyclable,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load scan history.");
  }

  const scans: ScanHistoryItem[] = data ?? [];

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">EcoScan AI</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Scan History
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Review your previous waste analyses, sorted from newest to oldest.
          </p>
        </div>

        <HistoryList scans={scans} />
      </div>
    </main>
  );
}
