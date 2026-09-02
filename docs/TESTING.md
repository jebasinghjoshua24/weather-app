# TESTING.md — bug-first, layered (60-sec)

**We find bugs before users do.** Three layers, each catches different bugs.

## Layers

| Layer | Tool | What it catches | When it runs |
|---|---|---|---|
| Unit | Vitest (`vitest.config.ts:1` `jsdom`) | `useDebouncedValue` waits 300ms, `zod` rejects bad input, `wmoToDescription` mapping | `npm run test` on every push |
| Integration | Vitest + RTL + msw | `useSearchAutocomplete` debounce→fetch once, `useWeatherData` 429→stale fallback | same `npm run test` |
| E2E | Playwright (`playwright.config.ts:1` chromium) | Type "San Francisco" → see results; deny geolocation → fallback city | `npm run test:e2e` on `main` push + nightly |
| a11y | `vitest-axe` | Missing alt, focus trap | unit suite |

## Gate
Doc → tests (red) → code (green) → lint/typecheck/build → push. CI is the bouncer: `lint` + `typecheck` + `unit` must pass before `build` (`ci.yml:60`).

## Why these libraries

- **Vitest vs Jest:** Vite-native, same config as Next, 3× faster.
- **msw vs nock:** intercepts `fetch` at network level, works with `next: {revalidate}`.
- **Playwright vs Cypress:** multi-browser (chromium/firefox/webkit) + `webServer` auto (`playwright.config.ts:18`).

## Algorithm (E2E example — typing burst)

1. Mock `GET /api/geocode?q=San*` to return `[{name:"San Francisco"}]`.
2. `userEvent.type(screen.getByRole("searchbox"), "San Francisco")` with no delay.
3. Assert `fetch` called ONCE (debounce) with `q=San Francisco`.
4. Assert dropdown shows San Francisco.

## 5-year-old example
Like checking homework three times: quick check (unit), group check (integration), teacher check (E2E).
