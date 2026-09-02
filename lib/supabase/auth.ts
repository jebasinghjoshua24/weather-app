import { createClient } from "@/lib/supabase/server";

/**
 * Auth helpers for Route Handlers + Server Components.
 * Why: RLS is only as strong as the user ID we pass with each request.
 * These helpers guarantee every protected endpoint knows WHO is asking,
 * and returns a clear 401/redirect otherwise.
 *
 * Think: the bouncer checks your ID card (session) before letting you
 * into the VIP room (your diary). No card, no entry.
 */

/**
 * Returns the signed-in user, or null if anonymous.
 * Safe for Server Components and Route Handlers. Never throws.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * For Route Handlers that REQUIRE a signed-in user.
 * Returns the user, or null when unauthenticated. Callers return 401.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  return user;
}

/**
 * Guards a route: if there's no session, respond 401 with a JSON error.
 * Use at the top of protected Route Handlers (/api/diary, /api/saved-locations, etc.)
 */
export async function getAuthedClientOr401() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false as const,
      error: { message: "Authentication required", code: "UNAUTHENTICATED" },
      user: null,
      supabase: null,
    };
  }

  return { ok: true as const, error: null, user, supabase };
}
