import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase admin client that uses the service role key.
 *
 * This client bypasses Row Level Security and must NEVER be imported
 * in client components or exposed to the browser.
 *
 * Use only for trusted server-side operations such as profile bootstrapping.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      // Disable automatic session persistence; this client is stateless.
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
