"use server";

import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    redirect("/login?error=invalid-credentials");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    redirect("/login?error=invalid-credentials");
  }

  // -------------------------------------------------------------------------
  // Ensure a corresponding profile row exists.
  //
  // profiles.id is a FK to auth.users.id. Because the profiles table has no
  // INSERT RLS policy (only SELECT and UPDATE), the anon client cannot create
  // the row. We use the service-role admin client which bypasses RLS.
  //
  // onConflict: "id" makes this a true upsert — existing profiles are left
  // unchanged (ignoreDuplicates: true), so no data is overwritten on login.
  // -------------------------------------------------------------------------

  const admin = createAdminClient();

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: data.user.id,
      email: data.user.email ?? email,
      full_name: data.user.user_metadata?.full_name ?? null,
      avatar_url: data.user.user_metadata?.avatar_url ?? null,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "id",
      ignoreDuplicates: true, // never overwrite an existing profile
    },
  );

  if (profileError) {
    // Log for operators but do not block login — the user authenticated
    // successfully. The profile will be retried on the next login.
    console.error("[Auth] Failed to upsert profile", {
      userId: data.user.id,
      error: profileError.message,
      code: profileError.code,
    });
  }

  redirect("/dashboard");
}
