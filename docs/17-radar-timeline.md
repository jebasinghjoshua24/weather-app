# 17 — Interactive Radar Timeline Slider (60-sec)

**In 60 seconds:** Tap *Radar* → a timeline appears under the map. Drag the slider → radar sweeps through the last 2 hours in 10-min frames. Hit *Play* → it animates. Uses free RainViewer tiles, no key.

## How it works

1. `lib/rainviewer.ts` `fetchRainViewer()` → `GET https://api.rainviewer.com/public/weather-maps.json` (host + `radar.past[]` timestamps) → normalized to `{frames: {time, path}[], host}`.
2. `hooks/useRainViewer.ts` `useQuery(["rainviewer"], 5m cache)` → `frames`.
3. `components/radar/RadarTimeline.tsx` holds `frameIdx` + `playing`. Slider `0..frames.length-1` sets idx. Play = `setInterval 600ms` advance. Emits `onFrameChange(path)` to parent.
4. `MapView` receives `radarPath: string | null` + `host` → renders `TileLayer(url=host+path+"/256/{z}/{x}/{y}/2/1_1.png", opacity 0.7)` above OSM tiles.

## Every function

| Function | What | Inputs | Outputs | File |
|---|---|---|---|---|
| `fetchRainViewer()` | Host + frames | — | `{host, frames}` | `lib/rainviewer.ts:4` |
| `useRainViewer()` | Query 5m | — | `{data}` | `hooks/useRainViewer.ts:4` |
| `RadarTimeline({onFrameChange})` | Slider + play | callback | JSX | `components/radar/RadarTimeline.tsx:4` |

## Why this way

- RainViewer is free, no key, global radar. Open-Meteo has no radar tiles.
- 5m cache matches RainViewer update interval (10m). Slider is client-only, no server proxy needed (tiles CORS allow).
- 5-year-old: Like flipping through weather photos quickly to see rain move.

## Algorithm

1. `GET https://api.rainviewer.com/public/weather-maps.json` → `json.radar.past` → last 8 frames → `frames = past.map(p=>({time:p.time, path:p.path}))`.
2. `frameIdx = slider.value`.
3. `TileLayer` url = `${host}${path}/256/{z}/{x}/{y}/2/1_1.png`.

## What could go wrong

| Case | What we do |
|---|---|
| No radar coverage (ocean) | Show "No radar here" |
| API 502 | Hide timeline |
