# GDPR.md — Mumbai ap-south-1 + GDPR (with PDPA/APPI overlay) (60-sec)

**Data lives in Mumbai.** The app is anonymous by default — you can check weather without signing in. Only diary/saved locations need an account.

## Where data lives

- Supabase project region `ap-south-1` (`supabase/config.toml:3`).
- Global audience: GDPR follows the user (Art 3) even though data sits in India. Mumbai has no EU adequacy decision → we rely on **SCCs (Standard Contractual Clauses)** via Supabase/Vercel DPAs + encryption at rest/in transit + RLS as technical safeguard.
- Local overlay: SG PDPA, JP APPI, AU Privacy Act — same practices (consent, purpose limitation, retention) satisfy all; documented together.

## What we store (only when you sign in)

| Data | Why | Legal basis | File |
|---|---|---|---|
| `profiles.unit/theme/consent_*` | Remember prefs + prove consent | Legitimate interest + consent | `supabase/migrations/0001_init.sql:9` |
| `saved_locations` | Your favorites | Consent | `migrations:33` |
| `weather_history` | Your diary (snapshot+mood+note) | Consent | `migrations:53` |
| `usePreferencesStore` localStorage | Unit/theme/recentSearches(5, 30d) | Consent before store | `store/usePreferencesStore.ts:23` |

## Rights (every user)

- **Access/Portability:** `GET /api/user/export` (future) returns JSON of profile+locations+history.
- **Erasure:** delete auth user → `on delete cascade` wipes all three tables (`migrations:6,34,54`). Local `clearRecentSearches()`.
- **Rectification:** `PATCH /api/profile`, `PATCH /api/saved_locations/:id`.
- **Retention:** `weather_history` 365d via `purge_old_weather_history():60` (pg_cron, guarded), `recentSearches` 30d local eviction.

## Algorithm (consent)

1. App shows banner; sets `hasConsented` + `consent_timestamp` only after click.
2. Until consent: `recentSearches` not persisted, Sentry/RSS/tiles not init.
3. On revoke: clear persisted prefs, delete server rows via `DELETE auth.users`.

## 5-year-old example
Your drawing (diary) goes into YOUR locker in Mumbai. Only your key opens it. If you ask to throw it away, the teacher throws the whole locker contents away. After a year, old drawings are thrown away automatically.
