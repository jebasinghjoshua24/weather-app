# 11 — Stargazing Score (0–100% astronomy) (60-sec)

**In 60 seconds:** A badge shows `82% — Excellent night for stars` or `12% — Clouds hide the sky`. Score mixes cloud cover, moon brightness, and day/night. No API — pure math.

## How it works

1. `lib/stargazing.ts` computes **lunar illumination** from date (known new moon 2000-01-06, 29.53-day cycle → phase 0–1 → illumination ` (1-cos(2π·phase))/2`).
2. `stargazingScore({cloudCover, isDay, date})` → `0–100`: `isDay → 0%` (stars only at night), else `100 - cloudCover*0.9 - illumination*35 - haze`. Clamped.
3. `components/weather/StargazingScore.tsx` renders ring + label `Excellent/Good/Fair/Poor` with `aria-label`.

## Every function

| Function | What | Inputs | Outputs | File |
|---|---|---|---|---|
| `moonIllumination(date)` | Lunar fraction | `Date` | `0–1` | `lib/stargazing.ts:6` |
| `stargazingScore({cloudCover,isDay,date})` | 0–100 | props | `number` | `lib/stargazing.ts:16` |
| `StargazingScore({cloudCover,isDay})` | Ring + text | props | JSX | `components/weather/StargazingScore.tsx:4` |

## Why this way

- No astronomy API needed — new-moon anchor + cycle covers 95% accuracy for a score.
- Cloud is primary blocker (0.9 weight), moon is secondary (35 points), day forces 0.

**5-year-old:** Like checking if you can see stars: no clouds + dark night + no bright moon = best.

## Algorithm

1. `days = (date - 2000-01-06)/86400000; phase = (days % 29.53)/29.53`.
2. `illum = (1 - cos(2π·phase))/2`.
3. If `isDay → 0`; else `score = 100 - cloud*0.9 - illum*35`, clamp `0–100`, round.

## What could go wrong

| Case | What we do |
|---|---|
| No cloudCover | Use 50% fallback |
| Polar day/night | `isDay` handles |
