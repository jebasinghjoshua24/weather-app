# SECURITY.md — threat model (60-sec)

**Pretend the app is a school.** Security headers are the fence, Zod is the front-door ID check, RLS is the locker that only opens with YOUR key, sanitization strips sharp objects from incoming mail.

## What we defend against

| Threat | How we stop it | Where |
|---|---|---|
| XSS via RSS/diary/location names | `sanitize-html` server allow-list + `zod` regex + React auto-escape | `app/api/rss:16`, `lib/validations.ts:17,47` |
| Stealing another user's diary | RLS `auth.uid()=user_id` + `references ... on delete cascade` | `supabase/migrations/0001_init.sql:14` |
| Leaking `lat/lon` in referrer | `Referrer-Policy: strict-origin-when-cross-origin` | `next.config.mjs:46` |
| Clickjacking geolocation prompt | `X-Frame-Options: DENY` + `frame-ancestors 'none'` | `next.config.mjs:30,44` |
| SSL-strip | `HSTS max-age=63072000 preload` | `next.config.mjs:14` |
| Open-proxy via `next/image` | `images.remotePatterns:73` allow-list only OSM/RainViewer/YouTube | `next.config.mjs:73` |
| Cost-exhaustion (free APIs) | Route handlers + `Cache-Control` + `staleTime` | `app/api/weather:30`, `CACHE_TTL:15` |
| Missing session | `proxy.ts:12` refreshes JWT every request | `lib/supabase/middleware.ts:9` |

## Algorithms

- **Validation:** every handler `safeParse` → 400/422 on fail, never reaches upstream.
- **Sanitization:** RSS items `sanitizeHtml(title,{allowedTags:[],allowedAttributes:{}})` server-side; diary `snapshot` capped 10k JSON length `lib/validations.ts:40`.

## Why these libraries

- **zod vs Joi/Yup:** zod = TypeScript-first, inferred types, tiny bundle; we already type weather shapes.
- **sanitize-html vs dompurify:** pure Node, no jsdom, deterministic allow-list; dompurify needs DOM.

## 5-year-old example
You get a letter (RSS). The teacher (sanitizer) throws away any letter with scissors inside, keeps only the words, then gives it to you. Your locker (RLS) only opens with your key.
