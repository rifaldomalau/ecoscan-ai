import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
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
  const avatarFallback = user.email?.charAt(0).toUpperCase() || "U";

  return (
    <AppShell
      avatarFallback={avatarFallback}
      eyebrow="History"
      title="Scan History"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Review your previous waste analyses, sorted from newest to oldest.
          </p>
        </div>

        <HistoryList scans={scans} />
      </div>
    </AppShell>
  );
}
