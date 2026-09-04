# 14 — Weather Twin (global matching) (60-sec)

**In 60 seconds:** See 3 cities whose weather feels most like yours right now — e.g. "Your 28°C in Mumbai feels like Bangkok 29°C, Dubai 30°C, Manila 27°C". Scores are live, not averages.

## How it works

1. `lib/weatherTwin.ts` has a baked city DB (≈40 world cities, lat/lon/country). On demand, `fetchTwins(userLat,userLon, userTemp, userHumidity)` fetches their weather in one batched call (`latitude=a,b&longitude=c,d`), then scores each: `score = 100 - (tempDiff*4 + humidityDiff*0.6 + windDiff*1.5 + codeDiff*12)` clamped 0–100.
2. `hooks/useWeatherTwin.ts` `useQuery(["twin",lat,lon,temp])` 15m cache, enabled when you have weather.
3. `WeatherTwin` shows 3 top twins with score, temp, and `wmoToDescription`.

## Every function

| Function | What | Inputs | Outputs | File |
|---|---|---|---|---|
| `TWIN_CITIES` | Baked DB 40 cities | — | `City[]` | `lib/weatherTwin.ts:4` |
| `scoreTwin(user, candidate)` | Weighted diff → 0–100 | weathers | `number` | `lib/weatherTwin.ts:18` |
| `fetchTwinWeathers(cities)` | Batched Open-Meteo `latitude=a,b` | cities | `WeatherResponse[]` | `lib/weatherTwin.ts:28` |
| `useWeatherTwin(lat,lon,weather)` | Query + sort top 3 | props | `{data}` | `hooks/useWeatherTwin.ts:4` |
| `WeatherTwin({lat,lon,weather})` | 3 cards | props | JSX | `components/weather/WeatherTwin.tsx:4` |

## Why this way

- Batch `latitude=a,b` is 1 call for 20 cities vs 20 calls — saves quota (600/min).
- Weighted temp 4 > humidity 0.6 > wind 1.5 > code 12: temp matters most for "feels like".
- 5-year-old: Like finding twins in a class photo by who looks most like you.

## Algorithm

1. `cities = TWIN_CITIES.filter(c => distance > 300km)` (don't twin with yourself).
2. `batch = cities.slice(0,20)` fetch `forecast?latitude=...&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`.
3. For each: `score = 100 - (|tDiff|*4 + |hDiff|*0.6 + |wDiff|*1.5 + (codeSame?0:12))`, clamp.

## What could go wrong

| Case | What we do |
|---|---|
| No weather yet | Hide |
| Upstream 502 | Show "Twins unavailable" |
| City too close | Filter >300km |

