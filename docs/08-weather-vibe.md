# 08 — Weather Vibe (AI-free poetic) (60-sec)

**In 60 seconds:** Instead of "Partly cloudy, 26°C" you see *"The sky wears a silver veil, soft and still."* No AI — 3–5 hand-written phrases per weather code × day/night, picked at random per reload. Zero network, zero bundle.

## How it works

1. `lib/vibe.ts:4` `VIBE_MAP[code]` → `{day:[…], night:[…]}` each 3–5 lines. Fallback `default`.
2. `hooks/useWeatherVibe.ts:4` `useMemo(() => pick(code+isDay+Date.now()), [code,isDay])` → stable per reload, changes on navigation.
3. `components/weather/WeatherVibe.tsx:4` `<p italic>` renders above `CurrentWeatherCard`. No skeleton/error — pure local.
4. Wire `app/page.tsx:60` as child of weather cascade (needs `weatherCode+isDay` from `data.current`).

## Every function

| Function | What | Inputs | Outputs | File |
|---|---|---|---|---|
| `getVibe(code,isDay,seed)` | Picks phrase | `code, isDay, seed` | `string` | `lib/vibe.ts:8` |
| `useWeatherVibe(code,isDay)` | Memo with `Date.now()` seed | `code,isDay` | `string` | `hooks/useWeatherVibe.ts:4` |
| `WeatherVibe({code,isDay})` | Renders italic | `code,isDay` | JSX | `components/weather/WeatherVibe.tsx:4` |

## Why no AI

| Option | Cost | Latency | Verdict |
|---|---|---|---|
| OpenAI/Claude | $/call + key proxy | 500ms+ | Overkill for a line. A hand table is instant, free, offline. |
| **`Table (chosen)`** | **`0`** | **`0ms`** | `~200` lines cover all WMO codes; variant seed gives variety without AI. |

**5-year-old:** Like a poetry book with 5 poems about each weather. You open it once, it picks one.

## Algorithm

1. `arr = VIBE_MAP[code]?.[isDay?"day":"night"] ?? VIBE_MAP.default[isDay?"day":"night"]`.
2. `idx = (seed + code*31 + isDay) % arr.length`.
3. Return `arr[idx]`.

## What could go wrong

| Case | What we do |
|---|---|
| Unknown code `99` missing | fallback `default` |
| `isDay` 0/1 only | covers all |
| No network | works offline (local) |

## How we test it

- Unit `vibe.test.ts`: every code 0–99 → string, day≠night, seed stable.
- E2E `vibe.spec.ts`: reload → maybe different phrase, never empty.
