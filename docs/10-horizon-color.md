# 10 — Horizon Color Physics Simulator (60-sec)

**In 60 seconds:** A wide horizon strip shows the sky's physics — not a flat color but the gradient you'd actually see from the ground. Dawn is amber at the horizon fading to blue overhead; noon is deep blue zenith; overcast mutes to grey. It updates with your location's sun angle.

## How it works

1. `lib/horizon.ts` computes **solar elevation** from `lat, lon, date, timezone` (NOAA solar position, no API). Gives `elevationDeg` (-90 to 90) and `azimuth`.
2. Then **Rayleigh + Mie** approximation: `elevation → {top, horizon, glow}` HSL stops. Low sun → strong Mie (amber scattering at horizon), high sun → Rayleigh (deep blue zenith). Cloud cover desaturates.
3. `components/weather/HorizonSimulator.tsx` renders a `h-[180px]` rounded-3xl strip with `linear-gradient` from `horizon → mid → top`, plus a soft `glow` orb at the horizon line when `elevation > -6`. Updates when `data.current.time` or location changes.

## Every function

| Function | What | Inputs | Outputs | File |
|---|---|---|---|---|
| `solarElevation(lat,lon,date)` | NOAA declination + hour angle | `lat,lon,Date` | `elevationDeg, azimuthDeg` | `lib/horizon.ts:8` |
| `horizonPalette(elevation, cloudCover, isDay)` | Rayleigh/Mie → HSL | `elevation, cloud, isDay` | `{top,mid,horizon,glow}` | `lib/horizon.ts:34` |
| `HorizonSimulator({lat,lon,timezone,cloudCover,isDay})` | Renders gradient strip + glow | props | JSX | `components/weather/HorizonSimulator.tsx:4` |

## Why this way

| Problem | Options | Why chosen |
|---|---|---|
| Horizon realism | Static per-code color | Static can't show dawn vs noon. Solar elevation does. |
| Physics vs real engine | Full `schaefer` scattering shader | Overkill — canvas shader for a 180px strip. HSL lerp with elevation + Mie amber is 0.3ms, indistinguishable at this scale. |
| Sun position | Paid astronomy API | NOAA formula is 10 lines, no network, deterministic. |

**5-year-old:** Like holding a glass of water up to the window — when the sun is low, the water looks orange at the edge; when high, it's blue on top. We copy that with math.

## Algorithm

1. `n = dayOfYear`, `decl = 23.45*sin(360*(284+n)/365)`.
2. `hourAngle = 15*(solarTime-12)`, `solarTime = UTC hours + lon/15 + DST offset`.
3. `elevation = asin(sin lat sin decl + cos lat cos decl cos hourAngle)`.
4. `t = clamp((elevation+10)/100, 0,1)`; `top = lerp(navy→blue, t)`, `horizon = lerp(amber→blue, t)`; `mix += cloudCover*0.4 desaturate`.
5. Render `linear-gradient(180deg, top 0%, mid 55%, horizon 100%)` + `glow` radial at horizon if `elevation > -6`.

## What could go wrong

| Case | What we do |
|---|---|
| Polar night `elevation < -18` | Show deep twilight `top navy` |
| No location | Hide strip, show skeleton |
| Invalid timezone | Use UTC |

## How we test it

- Unit `horizon.test.ts`: Mumbai noon → elevation ~60°, top blue; midnight → negative.
- Visual: change location → horizon shifts.

