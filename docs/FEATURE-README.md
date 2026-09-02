# FEATURE-README.md — how to add a feature (60-sec)

**Recipe:** doc → tests (red) → code (green) → push behind flag.

## Steps

1. Flip flag? Add entry to `FEATURES:40` in `lib/constants.ts:40` (`myFeature: false`).
2. If heavy, add entry to `lib/feature-registry.ts:12` (`dynamic()`).
3. Write `docs/NN-my-feature.md` using Recipe in `docs/README.md:3`.
4. Write tests: `tests/unit/useMyHook.test.ts` + `tests/integration/my-feature.test.tsx` + `tests/e2e/my-feature.spec.ts`.
5. Run `npm run test` (must fail first!).
6. Implement: `app/api/my-feature/route.ts` (Zod + cache) + `hooks/useMyFeature.ts` + `components/myFeature/*`.
7. Wire to parent: does it need `location`? Then child of `useWeatherData`. Independent? Own `enabled`.
8. Run `npm run lint && npm run typecheck && npm run build`.
9. Flip flag to `true` when ready to ship; merge to `main` behind CI.

## Why

Doc-first forces clarity; flag→dynamic prevents bundle bloat; parent loader prevents fetch storm.

## Algorithm (adding Weather Twin)

1. Add `FEATURES.weatherTwin: false`.
2. Add `docs/14-weather-twin.md` (60-sec + functions + why algorithm X over Y).
3. Tests: `useWeatherTwin` scores city list, mocks `/api/weather` batch.
4. Code: `app/api/weather/batch` + `lib/twin-score.ts` + `components/weather/WeatherTwin.tsx`.
5. Enable and test Lighthouse <200kB per route.

## 5-year-old example
Like adding a new ride to an amusement park: draw the poster first (doc), test the seatbelt (tests), build the ride (code), only open the gate when safe (flag).
