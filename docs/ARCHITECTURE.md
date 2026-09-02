# ARCHITECTURE.md — system map (60-sec)

**In one sentence:** a Next.js app that shows weather. The browser asks OUR server (`/api/*`), our server asks outside APIs (Open-Meteo, RainViewer, EONET, RSS), and two tiny stores keep UI prefs vs server data separate.

## Layers

```
Browser (anonymous by default)
 ├─ app/  /, /city/[slug], /radar, /diary, /globe
 ├─ components/ (lazy via lib/feature-registry.ts — flag → dynamic())
 ├─ hooks/ (useDebouncedValue, useSearchAutocomplete, useWeatherData, useGeolocation)
 ├─ store/ (Zustand: theme/unit/consent — persisted; location — memory)
 └─ TanStack Query (server cache, differentiated staleTime = CACHE_TTL:15)
      ↕
 Route Handlers (app/api/weather|geocode|air-quality|eonet|rss)
   Zod validation → fetch upstream → Cache-Control + CDN-Cache-Control
      ↕
 Outside: api.open-meteo.com, air-quality-api.open-meteo.com,
          geocoding-api.open-meteo.com, api.rainviewer.com, eonet.gsfc.nasa.gov,
          news RSS (region-aware, sanitized server-side)
 + Supabase Mumbai ap-south-1 (profiles, saved_locations, weather_history + RLS)
```

## Why this layering

| Decision | Options | Why we chose this | Real-world analogy |
|---|---|---|---|
| Zustand = UI prefs only; server data = TanStack | Redux for everything | Eliminates stale-closure bug (server data never in UI store) | Library card catalog vs bookshelves — don't mix |
| Route Handlers as BFF | Direct browser→upstream | One place to validate, cache, handle 429; schema change = one file | Front desk checks ID before you enter |
| Hybrid fetch (direct forecast/geocode, proxied others) | Proxy all or direct all | Direct leverages per-user IP (≈600/min each); proxy needed for CORS/XML/sanitize | Some mail you pick up, some must be screened |
| flag → dynamic() in feature-registry | Static imports | 500kB `three+globe.gl` never bundles into home page until `/globe` | Forklift stays in warehouse until needed |

## Dependency graph (F1 is source of truth)

```
useWeatherStore.location ──→ useWeatherData(lat,lon) [parent, ONE status]
                             ├─ F1 Current · F3 Hourly · F4 Map · F5 Clock · F9 Aura · F10 Horizon
                             └─ on isError → all children show "no data" (one cascade)
Independent siblings (own query, own enabled): F6 News · F7 EONET · F11 Stargazing …
```

## Functions (selected)

| Function | What it does | Inputs | Outputs | File |
|---|---|---|---|---|
| `useDebouncedValue` | Waits 300ms after typing stops, then releases the value | value, delay | debounced value | `hooks/useDebouncedValue.ts:4` |
| `useSearchAutocomplete` | Debounced → /api/geocode, caches 10m | rawQuery | {data, isPending} | `hooks/useSearchAutocomplete.ts:10` |
| `useWeatherData` | One fetch for current+hourly+daily, localStorage stale on 429 | lat, lon | WeatherResponse | `hooks/useWeatherData.ts:14` |
| `GET /api/weather` | Validates lat/lon → fetches Open-Meteo → CDN cache headers | lat, lon | JSON | `app/api/weather/route.ts:7` |

## Algorithm (hybrid fetch)

1. User types → client `useDebouncedValue` waits 300ms.
2. TanStack fires `/api/geocode?q=` (enabled only if ≥2 chars).
3. Handler validates via `searchQuerySchema:17`, fetches upstream with `revalidate:600`, returns `Cache-Control: public, s-maxage=600`.
4. Weather: `useWeatherData` enabled only when `lat&&lon`; handler `coordinatesSchema:11`; upstream `revalidate:300`; on 429 serve `localStorage` stale.

## Edge highlights
- `prefers-reduced-motion` disables aura; theme uses `next-themes` (no Zustand sync → no hydration mismatch).
- CSP (`next.config.mjs:8`) + `remotePatterns:73` allowlists OSM/RainViewer/YouTube only.
