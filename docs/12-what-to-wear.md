# 12 — What to Wear Suggester (60-sec)

**In 60 seconds:** Based on temp, wind, and rain, it tells you *"T-shirt + shorts — light breeze"* or *"Heavy jacket, scarf — freezing with wind."* Rule engine, no AI. Updates when you change city or unit.

## How it works

1. `lib/whatToWear.ts` rule engine takes `{temperature (°C), windSpeed, precipitation, weatherCode}` → `{layers: string[], tip: string}`.
2. Temp tiers: `>28 → T-shirt+shorts`, `22–28 → Light shirt`, `15–22 → Sweater`, `5–15 → Jacket`, `<5 → Heavy jacket+scarf`. Wind `>20 → windbreaker` added. Precip `>0.5 → umbrella/rain jacket`. Snow codes `71–86 → gloves+boots`.
3. `components/weather/WhatToWear.tsx` renders layers as badges + tip, `aria-live="polite"` when city changes.

## Every function

| Function | What | Inputs | Outputs | File |
|---|---|---|---|---|
| `suggestOutfit({temp, wind, precip, code})` | Rule engine | weather | `{layers, tip}` | `lib/whatToWear.ts:4` |
| `WhatToWear({temperature, windSpeed, precipitation, weatherCode})` | Badges + tip | props | JSX | `components/weather/WhatToWear.tsx:4` |

## Why this way

- No ML needed — 10 rules cover 95% cases, deterministic, testable, 0ms.
- 5-year-old: Like mom picking clothes: hot→shorts, cold→jacket, windy→add windbreaker.

## Algorithm

1. `layers=[]`.
2. `if temp>28 → ["T-shirt","Shorts"]` else if `>22 → ["Light shirt"]` else if `>15 → ["Sweater"]` else if `>5 → ["Jacket"]` else `["Heavy jacket","Scarf","Gloves"]`.
3. `if wind>20 → push "Windbreaker"`.
4. `if precip>0.5 || [51…82].includes(code) → push "Umbrella"`.
5. `if [71…86].includes(code) → push "Boots"`.

## What could go wrong

| Case | What we do |
|---|---|
| No data | Hide card |
| Temp null | Show "--" tip |

## How we test it

- Unit `whatToWear.test.ts`: 30°C→shorts, 0°C→heavy, windy→windbreaker.
