import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client.
 * Why separate? The browser client uses the anon key + RLS.
 * It can ONLY touch rows belonging to the logged-in user.
 * Think: a locker key that only opens your own locker.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Return a no-op client during build / when env missing (e.g. in tests)
    // so the app doesn't crash before env is configured.
    return null as unknown as ReturnType<typeof createBrowserClient>;
  }

  return createBrowserClient(url, anonKey);
}
