# 15 — Weather Mood Playlist (YouTube embeds) (60-sec)

**In 60 seconds:** Under the forecast you see a small YouTube player: rainy → lo-fi rain, clear → upbeat sunny, snow → winter acoustic. No key, no login — just curated video IDs per weather mood.

## How it works

1. `lib/playlist.ts` maps `weatherCode × isDay` → `mood` → `YouTube videoId` (curated, 8 moods). No API call — pure table.
2. `WeatherPlaylist({weatherCode,isDay})` renders `iframe src="https://www.youtube-nocookie.com/embed/{id}?rel=0"` with `frame-src` allowed in `next.config.mjs:29`.
3. Click the pill below to swap video within same mood (2–3 IDs per mood).

## Every function

| Function | What | Inputs | Outputs | File |
|---|---|---|---|---|
| `moodForCode(code,isDay)` | Code→mood | `code,isDay` | `"sunny"\|"cloudy"\|"rainy"...` | `lib/playlist.ts:4` |
| `playlistForMood(mood)` | Mood→videoIds | `mood` | `string[]` | `lib/playlist.ts:18` |
| `WeatherPlaylist({code,isDay})` | Iframe + pills | props | JSX | `components/weather/WeatherPlaylist.tsx:4` |

## Why this way

- Curated IDs vs YouTube Data API: no key, no quota, instant, works offline. `listType=search` needs no key but is flaky (requires `youtube-nocookie` + `rel=0`).
- 5-year-old: Like picking a song for the weather: sunny→happy song, rainy→cozy song.

## Algorithm

1. `mood = code 0→sunny, 1–2→partly, 3→cloudy, 45/48→fog, 51–65/80–82→rainy, 71–86→snow, 95–99→storm`.
2. `ids = PLAYLISTS[mood] ?? PLAYLISTS.sunny`.
3. Render `ids[0]` + pills to switch.

## What could go wrong

| Case | What we do |
|---|---|
| Unknown code | Fallback `sunny` |
| CSP blocks youtube | `frame-src` allow-list |

