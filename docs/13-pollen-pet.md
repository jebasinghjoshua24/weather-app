# 13 — Pollen & Pet Safety Index (AQI + pavement) (60-sec)

**In 60 seconds:** See `AQI 42 Good` + `Pollen Low` + `Pavement 34°C — Hot paws!` in one card. Pollen warns you, pavement temp warns your dog. No new key — Open-Meteo air-quality.

## How it works

1. `hooks/useAirQuality.ts:4` fetches `GET /api/air-quality?lat&lon` (`revalidate:1800`, 4-day pollen) → `current.us_aqi` + `grass_pollen` etc.
2. `lib/pollenPet.ts:4` maps `us_aqi 0–50→Good, 51–100→Moderate…` + max pollen `0–5→Low…` + **pavement temp** = `temperature_2m + (isDay? 12 : -2)` approx (sun heats asphalt 10–15°C above air; night slightly cooler) — simple, explainable. Thresholds: `<30 Safe, 30–45 Caution, >45 Burning`.
3. `PollenPetCard` shows 3 badges + paw icon + `aria-label`.

## Every function

| Function | What | Inputs | Outputs | File |
|---|---|---|---|---|
| `aquaLevel(aqi)` | US AQI → label | `aqi` | `"Good"` | `lib/pollenPet.ts:6` |
| `pollenLevel(max)` | 0–5→Low…Very High | `number` | `string` | `lib/pollenPet.ts:12` |
| `pavementTemp(air,isDay)` | Air→pavement | `temp,isDay` | `number` | `lib/pollenPet.ts:18` |
| `useAirQuality(lat,lon)` | Query | `lat,lon` | `{data}` | `hooks/useAirQuality.ts:4` |
| `PollenPetCard({lat,lon,temp,isDay})` | 3 badges | props | JSX | `components/weather/PollenPetCard.tsx:4` |

## Why this way

- Pavement has no API — derived via solar offset is honest and explainable (cite: asphalt +12°C day).
- 5-year-old: Like touching the road with your hand before your dog steps.

## Algorithm

1. `aqiLevel: 0–50 Good, 51–100 Moderate, 101–150 Unhealthy for Sensitive…`
2. `pollenMax = max(6 pollens); 0–1 Low, 1–3 Moderate, 3–5 High, >5 Very High`.
3. `pavement = air + (isDay?12:-2)`, `paw: <30 Safe, 30–45 Caution, >45 Burn`.

## What could go wrong

| Case | What we do |
|---|---|
| No air-quality (ocean) | Hide card, show "--" |
| No pollen season | `Low` |

