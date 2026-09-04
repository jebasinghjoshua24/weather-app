# 17 — Voice-Powered Search (Web Speech API) (60-sec)

**In 60 seconds:** Tap the mic in the search bar → speak "Mumbai" → it fills and searches. No key, no server — uses the browser's `webkitSpeechRecognition`. Hidden on unsupported browsers (Firefox).

## How it works

1. `hooks/useSpeech.ts:11` `useSpeechRecognition(onResult)` feature-detects `SpeechRecognition`/`webkitSpeechRecognition`, `lang en-US`, `interimResults false`.
2. `SearchBar:12` shows mic button only if `supported`, toggles `listening`, calls `start/stop`, `onResult` sets `q`.
3. Debounce + autocomplete then fires as normal.

## Why

- Web Speech API is free, no key, privacy (audio stays in browser).
- 5-year-old: Like talking to the search box.

## Algorithm

1. `start()` → new `SpeechRecognition()`, `onresult → onResult(transcript)`, `onend → setListening(false)`.

## What could go wrong

| Case | What we do |
|---|---|
| Unsupported | Hide mic |
| Permission denied | Show normal input |
