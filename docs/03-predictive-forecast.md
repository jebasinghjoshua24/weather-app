# 03 — Predictive Forecast (Next 3/6/9/12 hours) (60-sec)

**In 60 seconds:** Four small cards show what happens in 3, 6, 9, and 12 hours — time, temp, and condition. No chart, no clutter. Swipe on mobile. Updates when you search a new city or toggle C/F.

## How it works

1. `app/api/weather:27` fetches `hourly=temperature_2m,weather_code,precipitation,relative_humidity_2m,wind_speed_10m` for 7 days (168 hours). `useWeatherData(lat,lon)` caches `CACHE_TTL.hourly 15m`.
2. `components/weather/WeatherCards.tsx:25` `HourlyForecastRow` picks fixed indices `3,6,9,12` from `data.hourly` (Open-Meteo hourly is hourly, index = hours from now). Each slot renders `time → temp (C/F) → wmoToDescription`.
3. Parent `app/page.tsx:76` renders it **only when `data` exists**, as child of `useWeatherData` cascade — if weather fails, forecast hides too (single error).

## Every function

| Function | What | Inputs | Outputs | File |
|---|---|---|---|---|
| `HourlyForecastRow({data})` | 4 cards 3/6/9/12h | `WeatherResponse` | JSX | `components/weather/WeatherCards.tsx:25` |
| `wmoToDescription(code)` | Code→label | `code` | `"Partly cloudy"` | `lib/open-meteo.ts:125` |
| `formatTemp(c, unit)` | C→C/F + "--" guard | `celsius, unit` | `"26°C"` | `store/usePreferencesStore.ts:50` |

## Why this way

| Problem | Options | Why chosen |
|---|---|---|
| 168 hourly points is too many | Show all 24h scroll | 4 slots (3/6/9/12) is the 60-sec answer — enough to plan, small to scan. Mobile swipe, desktop row. |
| Time-from-index vs find-by-time | `find` nearest `Date.now()` | Index 3/6/9/12 is O(1), no `find`. Hourly is hourly, so index = offset. Good enough; DST handled by `timezone: auto`. |
| No library | Chart (recharts) | Chart would be F16 radar-style — overkill for 4 temps. Cards keep bundle 0. |

**5-year-old:** Like 4 sticky notes: "in 3 hours it'll be 28° and sunny", "in 6 hours 26° cloudy" — you can plan.

## Algorithm

1. `indices = [3,6,9,12]`.
2. For each `i`: `time = hourly.time[i]`, `temp = hourly.temperature[i]`, `code = hourly.weatherCode[i]`; `if missing → skip`.
3. Render `new Date(time).toLocaleTimeString(hour12)`, `formatTemp(temp, unit)`, `wmoToDescription(code)`.

## What could go wrong

| Case | What we do |
|---|---|
| `hourly` missing / short | Skip null slots, show remaining |
| `temp` NaN | `formatTemp` → `"--"` |
| `time` invalid | Skip card |

## How we test it

- Unit `forecast.test.ts`: indices map correctly, 3h temp matches hourly[3].
- E2E: search Mumbai → see 4 cards with `°C/°F` toggle.

