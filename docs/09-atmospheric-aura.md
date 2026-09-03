# 09 — Atmospheric Aura (drifting particles) (60-sec)

**In 60 seconds:** Floating light particles drift across the screen like dust motes in sunlight. Their color shifts with the weather — warm gold on clear days, cool silver on overcast, deep blue on storm nights. They're subtle enough to ignore, present enough to feel the atmosphere.

## How it works

1. `components/weather/AtmosphericAura.tsx` renders a `<canvas>` fixed `z-[1]` above the weather sky but below content.
2. Aura particles (20-40 soft radial-gradient blobs) drift slowly (`translate3d` + `scale` oscillation) with `requestAnimationFrame`.
3. `lib/aura.ts` derives an `AuraPalette` from the current `SkyScene` — `{ primary, accent, glow }` HSL values based on the weather group and time of day.
4. `lib/feature-registry.ts` already exports `LazyAura` behind `FEATURES.aura`. On mount, it receives `weatherCode + isDay`.
5. `prefers-reduced-motion` → render a single static frame (no rAF loop).

## Every function

| Function | What | Inputs | Outputs | File |
|---|---|---|---|---|
| `getAuraPalette(scene, isDay)` | Derives aura colors from sky scene | `SkyScene, isDay` | `AuraPalette` | `lib/aura.ts:4` |
| `AtmosphericAura({weatherCode,isDay})` | Canvas particle layer | `weatherCode,isDay` | JSX | `components/weather/AtmosphericAura.tsx:4` |

## Why this way

| Problem | Options | Why chosen |
|---|---|---|
| Color sync with weather | Derive from sky.ts palette | Single source of truth — clear day = warm gold aurora, night = deep blue, rain = silver. No manual mapping. |
| Performance | CSS particles vs canvas | Canvas gives per-particle opacity, size, drift — no DOM overhead. 40 particles = negligible GPU. |
| Reduced motion | Dynamic vs static | Static single frame avoids wasted GPU. |

**5-year-old:** Like dust motes floating in a sunbeam. You barely notice them, but the room feels different without them.

## Algorithm

1. On mount, create 20-40 particles with `{x, y, r, dx, dy, o, phase}`.
2. Each frame: `x += dx * 0.3`, `y += dy * 0.3`, `o += sin(phase + time)`.
3. Draw each as `ctx.beginPath(); radialGradient(x, y, 0, r*2, [primary at 0, accent at 0.4, transparent at 0.8])`.
4. When `weatherCode` changes → reinitialize palette, soft-fade old particles.
5. On `visibilitychange` → pause/resume rAF.

## What could go wrong

| Case | What we do |
|---|---|
| `weatherCode` null (no location) | Render nothing |
| Reduced motion | Static single frame, no rAF |

## How we test it

- Unit `aura.test.ts`: palette derived from clear day → warm hue, overcast → cool.
- Visual: aura should be barely noticeable — if you can count the particles, they're too bright.