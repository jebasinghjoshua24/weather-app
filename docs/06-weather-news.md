# 06 — Weather News Feed (region-aware RSS) (60-sec)

**In 60 seconds:** Under your forecast you see 5 fresh weather headlines for your region — e.g. Mumbai monsoon updates when you're looking at Mumbai, US storm news when you're in New York. Tap a headline → opens the article. If a region has no feed, we show global weather news. Everything is sanitized, so a bad feed can never inject scripts.

## How it works

1. `app/page.tsx` knows `location.country` (from `GeocodeResult.country:54` or `WeatherResponse` reverse). It renders `<NewsFeed country={location.country} />` as an **independent sibling** (own `useQuery`, own 10m cache, never blocks weather).
2. `hooks/useWeatherNews.ts:4` fires `GET /api/rss?region=IN` (or `US`, `GB`… `global` fallback).
3. `app/api/rss:7` picks `FEEDS[region] ?? FEEDS.global` (Google News RSS `q=weather+region`), fetches with `revalidate:600`, parses `<item>` blocks via regex, extracts `title/link/pubDate`, sanitizes `title` with `sanitize-html:16` `{allowedTags:[], allowedAttributes:{}}` (strips `<script><svg onload>` etc), returns `{items: {title,link,pubDate}[]}` with `Cache-Control: public, s-maxage=600`.
4. `NewsFeed` shows skeleton while `isPending`, list when `data`, `"No news"` when empty, `"News unavailable"` on `isError`.

## Every function

| Function | What | Inputs | Outputs | File |
|---|---|---|---|---|
| `GET /api/rss` | Region-aware fetch → sanitize → cache | `region` | `{items[]}` | `app/api/rss/route.ts:7` |
| `useWeatherNews(country)` | Query wrapper, maps `IN→IN`, `null→global` | `country` | `{data,isPending,isError}` | `hooks/useWeatherNews.ts:4` |
| `NewsFeed({country})` | List + empty/error + `rel=noreferrer` links | `country` | JSX | `components/weather/NewsFeed.tsx:4` |

## Why we built it this way

| Problem | Options | Why chosen |
|---|---|---|
| Region relevance | Fixed global feed | Global alone feels irrelevant in Mumbai. Region param keeps it personal without storing location history. |
| CORS + XML | Direct `fetch` Google RSS from browser | RSS is XML and blocks CORS. Server proxy converts XML→JSON and bypasses CORS in one place. |
| XSS via feed HTML | Render raw `title` | Feeds are third-party HTML. `sanitize-html` allow-list `[]` (text only) guarantees no script survives, even if feed is compromised. |
| Cost/bundle | `rss-parser` heavy | Regex + `sanitize-html` is `~30kB` vs `~100kB` parser for only 5 items; we don't need full RSS spec. |

**5-year-old:** Like a newspaper stand that gives you the Mumbai paper when you're in Mumbai, and the world paper otherwise. The teacher checks every headline for bad words before handing it to you.

## Algorithm (sanitize)

1. Fetch `FEEDS[region] ?? FEEDS.global` (`Google News RSS q=weather+country`).
2. `const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0,5)`.
3. For each: `title = sanitizeHtml(get("title"), {allowedTags:[], allowedAttributes:{}}).trim()`.
4. Return `{title: sanitize result, link: raw (validated as https), pubDate}`.
5. `useWeatherNews` maps `country: "India"→"IN"` via tiny `COUNTRY_TO_REGION` map, else `global`.

## What could go wrong

| Case | What we do |
|---|---|
| Region no feed / unknown country | Fallback `global` |
| Feed 502 / timeout | `NewsFeed` shows `"News unavailable"` + retry button, never blocks weather |
| Feed returns HTML/script in title | `sanitize-html` strips to text |
| `link` not https | Drop item (never render `javascript:`) |
| Empty `<item>` | Skip, show `"No weather news right now"` |

## How we stay safe

- Server `sanitizeHtml` with `allowedTags:[]` → plain text only.
- `link` validated `startsWith("https://")` before rendering; `target="_blank" rel="noreferrer"`.
- `Cache-Control` 10m prevents hammering Google RSS.

## How we test it

- Unit `rss.test.ts`: global vs `IN` feed, HTML in title stripped, empty feed.
- Integration `NewsFeed.test.tsx`: pending skeleton, data list, error state.
- E2E `news.spec.ts`: search Mumbai → news list appears (mocked `GET /api/rss?region=IN`).
