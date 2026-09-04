# 21 — Offline-First PWA + Weather History Diary (60-sec)

**In 60 seconds:** Your weather checks are saved as a diary (Supabase when signed in, localStorage when offline). The app works offline — shell loads, last weather shows. When back online, local entries sync.

## How it works

1. `app/manifest.ts` makes it installable (standalone, icons).
2. `components/weather/WeatherDiary.tsx` on each successful `useWeatherData` offers *Save to diary* → `localStorage("atmos_diary")` always + `supabase.from("weather_history").insert` if signed in. On load, merge local + remote.
3. Offline: service worker (next-pwa, future) caches shell; diary reads local only.

## Why

- Supabase for sync, localStorage for offline — covers both. No extra dep for PWA shell now (manifest enough for installable).

## Algorithm

1. `save()` → `local.push({id, location, snapshot, at})` → if `session` → `supabase insert`.
2. `load()` → `local + remote` dedup by `id`.

## What could go wrong

| Case | What we do |
|---|---|
| Offline | Save local, sync later |
| No session | Local only |

