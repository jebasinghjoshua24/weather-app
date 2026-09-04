"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { WeatherResponse } from "@/lib/open-meteo";

interface DiaryEntry {
  id: string;
  location: { name: string; lat: number; lon: number };
  snapshot: WeatherResponse;
  at: string;
}

const KEY = "atmos_diary";

export function WeatherDiary({ weather, location }: { weather?: WeatherResponse | null; location?: { name: string; lat: number; lon: number } | null }) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage once on mount
      if (raw) setEntries(JSON.parse(raw) as DiaryEntry[]);
    } catch {}
    // Try Supabase load if signed in
    (async () => {
      const supabase = createClient();
      if (!supabase) return;
      const { data: sessData } = await supabase.auth.getSession();
      if (!sessData.session) return;
      const { data } = await supabase.from("weather_history").select("*").order("created_at", { ascending: false }).limit(20);
      if (data && Array.isArray(data)) {
        const mapped: DiaryEntry[] = data.map((r: Record<string, unknown>) => ({
          id: r.id as string,
          location: r.location as DiaryEntry["location"],
          snapshot: r.snapshot as WeatherResponse,
          at: r.created_at as string,
        }));
        setEntries((prev) => {
          const merged = [...mapped, ...prev.filter((p) => !mapped.some((m) => m.id === p.id))].slice(0, 20);
          return merged;
        });
      }
    })();
  }, []);

  const save = async () => {
    if (!weather || !location) return;
    setSaving(true);
    const entry: DiaryEntry = { id: `${Date.now()}`, location, snapshot: weather, at: new Date().toISOString() };
    const next = [entry, ...entries].slice(0, 20);
    setEntries(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    try {
      const supabase = createClient();
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      await supabase.from("weather_history").insert({ user_id: data.session.user.id, location, snapshot: weather as unknown as Record<string, unknown> });
    } catch {}
    setSaving(false);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md space-y-3">
      <h3 className="font-[var(--font-slab)] text-base font-bold text-white">Weather Diary (offline-ready)</h3>
      <button onClick={save} disabled={!weather || saving} className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-900 disabled:opacity-50">
        {saving ? "Saving…" : "Save current weather"}
      </button>
      <div className="space-y-2 max-h-48 overflow-auto">
        {entries.length === 0 ? (
          <p className="text-sm text-slate-400">No entries yet — save one.</p>
        ) : (
          entries.map((e) => (
            <div key={e.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-sm font-semibold text-white">{e.location.name} — {Math.round(e.snapshot.current.temperature)}°</p>
              <p className="text-xs text-slate-300">{new Date(e.at).toLocaleString()} · {e.snapshot.timezone}</p>
            </div>
          ))
        )}
      </div>
      <p className="text-xs text-slate-400">Installable via manifest · Offline-ready shell</p>
    </div>
  );
}
