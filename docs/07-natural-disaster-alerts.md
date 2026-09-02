# 07 — Natural Disaster Alerts (NASA EONET, location-filtered) (60-sec)

**In 60 seconds:** Under News you see disasters **near you** — not global noise. Searching Mumbai shows nearby wildfires/storms within ~500km; storms with `≥64 kts` show a severe banner. Each card has `wildfires · Woodson, TX · 15479 acres · 2026-09-01 · IRWIN` with map pins on the **main** Leaflet map. Tap a card → map flies to it.

## How it works

1. `app/page.tsx:64` renders `<DisasterAlerts location={location} />` as independent sibling (own `useQuery`, 10m cache, never blocks weather).
2. `hooks/useEonet.ts:4` fetches `GET /api/eonet?status=open&limit=20&category=wildfires` → handler validates via `lib/validations.ts:61` (`status enum open/closed/all, limit 1–50, category enum 13`), builds `EONET_API:10` URL, fetches with `revalidate:600`, sanitizes `title` via `sanitize-html:16` + `https` filter for `sources[].url`, returns `{events}` with `Cache-Control: public, s-maxage=600`.
3. Hook then **filters client-side by location**: `Haversine(user lat/lon, event geometry [lon,lat]) ≤ 500km` (`lib/eonet.ts:42`). EONET has no `lat/lon` query, so we fetch global 20 then filter. Empty → `"No disasters near you"`.
4. `components/disaster/DisasterAlerts.tsx:4` shows skeleton → error `"Disasters unavailable"` → empty → list. `isSevere(event)` (`≥64 kts` or `≥1000 acres`) and within bbox → banner `role="status"`.
5. `components/map/MapView.tsx:36` receives `disasters: EonetEvent[]` and renders extra `Marker`s (clustered, `Polygon` fallback) on the main map; clicking a card calls `flyTo`.

## Every function

| Function | What | Inputs | Outputs | File |
|---|---|---|---|---|
| `GET /api/eonet` | Validates → fetches EONET → sanitizes → caches | `status, limit, category` | `{events}` | `app/api/eonet/route.ts:3` |
| `useEonet(location, category)` | Query + distance filter | `Location\|null, category` | `{data:filtered, bannerEvent, isPending}` | `hooks/useEonet.ts:4` |
| `haversineKm(lat1,lon1,lat2,lon2)` | Distance | coords | km | `lib/eonet.ts:42` |
| `isSevere(event)` | `≥64 kts` or `≥1000 acres` | `EonetEvent` | boolean | `lib/eonet.ts:55` |
| `DisasterAlerts({location})` | List + banner + filter chips | `location` | JSX | `components/disaster/DisasterAlerts.tsx:4` |
| `MapView({disasters})` | Renders disaster pins | `disasters[]` | JSX | `components/map/MapView.tsx:36` |

## Why this way

| Problem | Options | Why chosen |
|---|---|---|
| EONET global vs local | Show global 20 | Global feels like spam in Mumbai. Client Haversine 500km filters to *near you* without needing EONET bbox (which doesn't exist). |
| CORS | Direct browser→eonet.gsfc.nasa.gov | Blocks CORS + needs sanitize in one place → BFF proxy. |
| `Sanitize` | Render raw `title`/`description` | Feeds are third-party JSON; `sanitize-html` `[]` guarantees no script survives. |
| Severe UX | List only | `≥64 kts` is hurricane-force — deserves a banner `role="status"` (pulses once, respects `prefers-reduced-motion`). |
| Map pins | Separate mini-map | Reusing main `MapView` (already lazy via `LazyMap:17`) keeps bundle lean, no second Leaflet instance. |

**5-year-old:** Like a fire station radio. It listens to NASA, keeps only fires/storms near your house, and rings a loud bell if a big one is close. Pins appear on your wall map.

## Algorithm (location filter + banner)

1. Fetch `GET https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=20[&category=wildfires]`.
2. For each `event.geometry[0].coordinates [lon,lat]` → `km = haversine(user.lat,user.lon, lat,lon)`.
3. Keep if `km ≤ 500` (or all if `location` null → fallback global).
4. `isSevere = (magnitudeUnit==="kts" && value>=64) || (acres && value>=1000)`.
5. `bannerEvent = filtered.find(isSevere)` → render banner.
6. Map: for each filtered, `Marker([lat,lon])` + `Popup(title)`; `Polygon` if `type==="Polygon"` (first ring).

## What could go wrong

| Case | What we do |
|---|---|
| EONET 502 / timeout | Card shows `"Disasters unavailable"` + retry, never blocks weather |
| Empty filter (`0 near you`) | `"No disasters near you"` (not `"No disasters"` globally) |
| `category` invalid | Handler 400, hook not fired |
| `magnitude null` (volcano) | `isSevere` false, still lists |
| `Polygon` geometry | Render `Polygon` first ring; fallback to centroid |
| `source url` not `https` | Dropped (`https` check) |
| `description: null` | Skip, show title only |
| `lat/lon` leak via referrer | `Referrer-Policy` strict + `connect-src` allow-list already |

## How we stay safe

- `sanitizeHtml(title)` + `link.startsWith("https://")` filter (like `rss:16`).
- No `next/image` for EONET (no open-proxy).
- `Referrer-Policy: strict-origin-when-cross-origin` covers `lat/lon`.

## How we test it

- Unit `eonet.test.ts`: Haversine Mumbai→near vs far, `isSevere` thresholds.
- Integration `DisasterAlerts.test.tsx`: msw mocked global 3 → filtered 1 near you, empty, error, banner.
- E2E `disaster.spec.ts`: select wildfires → chip filters, click alert → map flies.
