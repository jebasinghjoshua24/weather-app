# EDGE-CASES.md — master register (60-sec)

| # | Case | What happens | Who handles it |
|---|---|---|---|
| 1 | Geolocation denied / timeout | Fall back to `DEFAULT_LOCATION:27` New York, show banner "Enable location for local weather" | `hooks/useGeolocation.ts:8` |
| 2 | Antarctica / ocean (no forecast) | Handler returns 502 "Upstream unavailable" → parent `useWeatherData` `isError` → all children show "Weather data not available" | `app/api/weather:22` |
| 3 | Open-Meteo 429 shared-IP quota | Handler returns 429 → client serves `localStorage` stale + toast "Data may be ~1h old" | `hooks/useWeatherData.ts:20` |
| 4 | Typing burst | Client `useDebouncedValue` 300ms → 13 keys → 1 network call | `hooks/useDebouncedValue.ts:4` |
| 5 | Invalid city / XSS payload | `searchQuerySchema:17` rejects → 400; `savedLocation name` regex rejects `<svg>` | `lib/validations.ts:17,47` |
| 6 | Snapshot oversized | `zod refine length<10k` → 422 | `lib/validations.ts:40` |
| 7 | RSS HTML in title | `sanitizeHtml` strips tags server-side | `app/api/rss:16` |
| 8 | Session expired | `proxy.ts:12` refreshes JWT every request | `lib/supabase/middleware.ts:9` |
| 9 | Consent revoked mid-session | Clear `weather-prefs` localStorage, block Sentry/tiles, DELETE server rows | `store/usePreferencesStore` |
| 10 | Heavy bundle (globe 500kB) | `lib/feature-registry.ts:12` `FEATURES.globe ? dynamic() : () => null` never bundles into home | `lib/constants.ts:40` |
| 11 | Reduced motion | `globals.css:44` disables aura animations | `app/globals.css:44` |
| 12 | Offline | Service worker (future) serves shell + queued diary flush on reconnect | `FEATURES.pwaDiary` |
| 13 | `lat/lon` leak via referrer | `Referrer-Policy` strict + `connect-src` allow-list | `next.config.mjs:46` |

## 5-year-old example
If you ask for weather in the ocean, the app says "I don't have that" instead of crashing. If you type super fast, it waits until you stop to ask once.
