import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client.
 * Why separate? The browser client uses the anon key + RLS.
 * It can ONLY touch rows belonging to the logged-in user.
 * Think: a locker key that only opens your own locker.
 *
 * Returns null when env vars are missing (e.g. during build/tests)
 * so callers can degrade gracefully instead of crashing.
 */
export type BrowserSupabaseClient = SupabaseClient | null;

export function createClient(): BrowserSupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createBrowserClient(url, anonKey);
}
