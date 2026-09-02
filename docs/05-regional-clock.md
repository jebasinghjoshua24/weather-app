# 05 — Live Regional Clock (60-sec)

**In 60 seconds:** You search Mumbai → the clock instantly shows Mumbai time `08:30:45 PM Tue, Sep 2` ticking every second. Search London → it flips to London time. It’s always the *weather location’s* time, not your phone’s time, and it handles daylight saving automatically.

## How it works (step-by-step)

1. You pick a city → `useWeatherStore.location` holds `{lat,lon,name,timezone}`.
2. `useWeatherData(lat,lon)` fetches weather → returns `data.timezone` (e.g. `Asia/Kolkata`), or fallback to `location.timezone`, or `UTC`.
3. `useRegionalClock(timezone)` creates `Intl.DateTimeFormat` for that timezone and starts a `setInterval(1000)` → updates `now` every second.
4. `RegionalClock` renders `<time dateTime>` with `08:30:45 PM` + `Tue, Sep 2` + `+05:30` badge. `aria-live="polite"` lets screen readers hear the time once per minute.
5. Change city → `timezone` changes → formatter recreated, interval reset. Tab hidden → interval paused (battery). Tab visible → immediate tick + resume.

## Every function

| Function | What it does | Inputs | Outputs | File |
|---|---|---|---|---|
| `useRegionalClock(timezone)` | Ticks every second, formats via Intl | `timezone string\|undefined` | `{time, date, offset, isValid, iso}` | `hooks/useRegionalClock.ts:4` |
| `formatRegionalTime(date, timezone)` | Pure 12h time | `Date, timezone` | `"08:30:45 PM"` | `lib/time.ts:4` |
| `formatRegionalDate(date, timezone)` | Pure date | `Date, timezone` | `"Tue, Sep 2"` | `lib/time.ts:14` |
| `formatRegionalOffset(date, timezone)` | UTC offset for badge | `Date, timezone` | `"+05:30"` | `lib/time.ts:24` |
| `RegionalClock` | Presentational `<time>` + badge | `timezone, name` | JSX | `components/weather/RegionalClock.tsx:4` |

## Why we built it this way

### Problem
JavaScript `new Date()` is always your device time. Showing `19° Mumbai` with `19:30` London time would be wrong and confusing. We need *regional* time that follows DST (Mumbai has no DST, London has summer +1h).

### Options we compared

| Option | Bundle | DST | Verdict |
|---|---|---|---|
| `moment` + `moment-timezone` | `~400kB` | manual | Deprecated, ships 100kB tz data we already have in the browser. Heavy for one clock. |
| `luxon` | `~80kB` | good | Still ships tz data. Overkill. |
| `date-fns` + `date-fs-tz` | `~30kB` | good | Extra dep for one line. |
| **`Intl` (chosen)** | **`0kB`** | **automatic** | Browser’s ICU data already knows DST. `timeZone` param does the work. |

### How `Intl` solves it
`new Intl.DateTimeFormat("en", {timeZone:"Asia/Kolkata", hour:"numeric", minute:"2-digit", second:"2-digit", hour12:true}).format(now)` → correct local time, no library. `RangeError` on bad timezone → fallback `UTC` (never crash).

### Real-world example (5-year-old)
Like a magic watch. You point it at a city on the globe, and it instantly shows what time it is *there*. The watch never needs winding — it just knows because the world map is inside it.

## Algorithm

1. **Init:** `try { formatter = new Intl.DateTimeFormat("en", {timeZone}) } catch { fallback UTC, isValid=false }`.
2. **Tick:** `setInterval(1000, () => setNow(new Date()))`.
3. **Visibility:** `document.visibilitychange` → if `hidden` clear interval; if `visible` set immediate `now` + restart interval.
4. **Timezone change:** `useEffect(timezone)` → recreate formatter, reset interval.
5. **Cleanup:** `clearInterval` + remove listener on unmount.
6. **Render:** `formatRegionalTime(now, tz)` + `formatRegionalDate(now, tz)` + `formatRegionalOffset(now, tz)`.

## What could go wrong

| Case | What we do |
|---|---|
| `timezone` missing/invalid (`"Mars/Phobos"`) | `isValid:false`, show `--:--` + `UTC +00:00` badge, never throw |
| `location` null on first render | Show skeleton until `useWeatherData` resolves |
| Hydration (server UTC vs client Kolkata) | Server renders placeholder `UTC`; client hydrates in `useEffect` → no mismatch (suppressHydrationWarning on `<html>` already) |
| DST spring-forward gap (02:00→03:00 skipped) | `Intl` skips automatically, time jumps correctly |
| Tab hidden for hours, then visible | Immediate tick + formatter reuses current `now` (no drift) |
| User changes system locale | `Intl` uses `"en"` fixed, so stable (i18n later) |

## How we stay safe

- No HTML, no `dangerouslySetInnerHTML`, no network call — pure `Intl` (no XSS).
- No PII — timezone is city-level, not precise location.
- `aria-live="polite"` not `assertive` → screen reader not spammed every second.

## How we test it

- **Unit `lib/time.test.ts`:** Mumbai `2026-09-02T15:00Z → 08:30:45 PM +05:30 Tue, Sep 2`; London DST; invalid → `UTC`.
- **Integration `useRegionalClock.test.tsx`:** fake timers advance 1s → `time` changes; `visibilitychange` hidden → tick paused.
- **E2E `regional-clock.spec.ts`:** search Mumbai → clock shows `IST`; type London → flips to `BST`.
