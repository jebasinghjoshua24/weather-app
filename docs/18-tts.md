# 18 — Text-to-Speech Read-Aloud (60-sec)

**In 60 seconds:** On the current weather card, tap the speaker → it reads "Mumbai: Partly cloudy, 26 degrees, wind 6 kilometers per hour, day". Tap again to stop. Uses `speechSynthesis`.

## How it works

1. `hooks/useSpeech.ts:41` `useSpeechSynthesis()` detects `speechSynthesis`, `speak(text)` does `cancel()` → new `SpeechSynthesisUtterance(text)` → `onstart/onend`.
2. `WeatherCards:8` builds `text` from `name + wmoToDescription + temp + wind + day` and shows speaker button.

## Why

- Free, no key, privacy. `Web Speech API` vs paid `Azure` — free is enough for a weather read.

## Algorithm

1. `speak(text)` → `speechSynthesis.cancel()` → `utter = new SpeechSynthesisUtterance(text)` → `speak`.

## What could go wrong

| Case | What we do |
|---|---|
| Unsupported | Hide speaker |
| Speaking + navigate | `useEffect cleanup cancel()` |
