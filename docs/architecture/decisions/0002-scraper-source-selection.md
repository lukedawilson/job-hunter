# 2. Scraper source selection — built, skipped, and why

Date: 2026-07-10

## Status

Accepted

## Context

The `/search` command must draw from multiple job boards. Each board presents a different technical challenge: some are SPA-only, some actively block bots, some offer RSS feeds, some are entirely client-rendered. This ADR records which sources we built scrapers for, which we skipped, and the technical rationale for each.

We have 7 functioning scrapers (remoteok, weworkremotely, ycombinator, hnews, remotive, eurotechjobs, arc) plus 1 new addition (indeed). 5 were attempted but rejected or deferred.

## Decision

### Built (8 sources)

| Source | Method | Pagination | Notes |
|---|---|---|---|
| **Remote OK** | Playwright + internal API (`/api?tag=dev`) | None (all results at once) | Simple JSON API, no pagination needed |
| **We Work Remotely** | Playwright + search page scraping | `?page=N` URL param | 3 pages per search, ~30 results/pass |
| **Y Combinator Jobs** | Playwright + scroll-based pagination | `window.scrollBy` per page | SPA with infinite scroll; 3 scrolls per search |
| **Hacker News: Who is Hiring** | Playwright + Algolia API + comment scraping | None (all comments loaded) | Finds monthly thread via Algolia search, then scrapes comments. Low-signal but useful for niche roles |
| **Remotive** | Playwright + listing page scraping | None (single page) | Extracts from `<a>` links with numeric-ID slugs |
| **EuroTechJobs** | Playwright + `li.premiumJobContainer` | None (single page) | EU-focused; parsed company from text content after title |
| **Arc** | Playwright + listing page | None (single page) | SSR-rendered page, simple link extraction |
| **Indeed** | Playwright + search results `div.job_seen_beacon` | `&start=0,10,20,...` URL param | Largest pool: 43 results from 3 pages. Uses `&l=Remote&sort=date` |

### Skipped (5 sources)

| Source | Verdict | Reason |
|---|---|---|
| **LinkedIn Jobs** | **Rejected** | User request ("LinkedIn is shit"). Would require login, aggressive anti-bot measures, and account risk |
| **Glassdoor** | **Rejected** | 403 on webfetch. Would need Playwright + stealth bypass. Deferred until demand justifies the effort |
| **Himalayas** | **Deferred** | Page loaded but jobs are client-rendered; timed out on `networkidle`. Would need API reverse-engineering or longer timeouts. SPA with heavy JS bundles |
| **Wellfound (AngelList)** | **Rejected** | Network-level block (`ERR_ABORTED` in Playwright). Likely Cloudflare or similar WAF blocking headless browsers |
| **Indeed RSS** | **Rejected** | 404 on `rss.indeed.com/rss?q=...`. RSS feed URL pattern is either deprecated or requires different parameters. Switched to HTML scraping instead, which works |

### Technical patterns

- **Pagination support:** `scrape.js` accepts `--pages N`. It loops 0..N-1, calling `site.search(context, query, limit, pageNum)` and deduplicating by URL. Sites that don't support pagination receive `pageNum=0` and return a single batch.
- **Limit semantics:** `--limit` controls results per page. The `searchLimit` in `.jobhunterrc` controls the final displayed count. Scrapers fetch generously (30/page) and the command filters down.
- **Anti-detection:** All Playwright scrapers use `playwright-extra` + `puppeteer-extra-plugin-stealth`. Per-source context isolation. Realistic viewport, locale, and user agent.

### Architecture

```
scripts/scrape.js          # CLI entry: --source, --query, --limit, --pages
  └── scripts/sites/
        ├── remoteok.js    # API-based
        ├── weworkremotely.js  # Search page + URL pagination
        ├── ycombinator.js # SPA + scroll pagination
        ├── hnews.js       # Algolia API + comment scraping
        ├── remotive.js    # Listing page
        ├── eurotechjobs.js   # EU job board
        ├── arc.js         # SSR listing
        └── indeed.js      # Search results + URL pagination
```

## Consequences

- **Pro:** 8 scrapers cover the major remote job boards. The Indeed addition alone tripled the raw result pool.
- **Pro:** Pagination framework allows scaling results per source without per-site changes.
- **Con:** 5 sources are skipped/deferred. The worldwide-remote + staff/principal-level intersection remains narrow on the boards we can access.
- **Risk:** New boards may emerge; the scraper framework makes adding them trivial (`require('./sites/<name>').search(context, query, limit)`).
- **Future work:** Himalayas API reverse-engineering would unblock a clean remote-only board with 100k+ listings. Glassdoor may be worth revisiting as demand grows.

## References

- [ADR 0001 — Use Playwright with stealth plugin](./0001-use-playwright-for-job-board-scraping.md)
- `scripts/scrape.js` — CLI entry point
- `scripts/sites/` — all site modules
