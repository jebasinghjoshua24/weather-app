"use client";

import { createClient, type BrowserSupabaseClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

/**
 * Client hook that subscribes to auth state changes.
 * Why: the UI needs to know when a user signs in/out to show the right
 * controls (e.g. "Sign in" vs "My diary").
 */
export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase: BrowserSupabaseClient = createClient();
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fallback when Supabase not configured (build/test without env)
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then((response: { data: { session: Session | null } }) => {
      setSession(response.data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, currentSession: Session | null) => {
      setSession(currentSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, loading };
}