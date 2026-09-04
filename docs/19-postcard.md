# 19 — Weather Postcard Generator (PNG download) (60-sec)

**In 60 seconds:** Tap *Download Postcard* on the weather card → a 800×500 PNG downloads: city name, temp, condition, date, with a gradient matching the weather. No server, pure canvas.

## How it works

1. `components/weather/WeatherPostcard.tsx:4` has a hidden `<canvas>` ref. On click, `canvas.getContext("2d")` draws gradient (from `getSkyScene`), white card, text (`name`, `temp`, `wmoToDescription`, date), and vibe quote.
2. `canvas.toDataURL("image/png")` → `a.download = "atmos-${name}.png"` → click.

## Why

- Pure canvas vs `html2canvas` (extra 30kB, CORS taint) vs server Puppeteer (needs Vercel). Canvas is 0 dep, instant, no taint.

## Algorithm

1. `canvas.width=800, height=500`, fill gradient `top→bottom`.
2. Draw white rounded rect, text, temp big, condition, date.
3. `a.href = canvas.toDataURL(); a.download; a.click()`.

## What could go wrong

| Case | What we do |
|---|---|
| No weather | Hide button |
| Canvas taint | No external images, only text/gradient |
