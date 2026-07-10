# 1. Use Playwright with stealth plugin for job board scraping

Date: 2026-07-10

## Status

Accepted

## Context

The `/search` command must pull job listings from multiple job boards (LinkedIn Jobs, Indeed, Wellfound, Hacker News "Who is hiring?", Remote OK, We Work Remotely, Glassdoor, Y Combinator Jobs, Arc, Remotive, European Tech Jobs). Many of these are JS-rendered single-page applications; the built-in `webfetch` tool cannot execute JavaScript and will return empty or skeleton HTML for these sources.

The tool is a single-user, low-volume job hunting aide — not a high-throughput production scraper. Request volume per search is 10–20 page loads spread across 5–10 domains.

Key concerns:
- **Rendering:** many listings are behind client-side rendering
- **Detection:** job boards may block headless automation
- **Simplicity:** the tool runs locally, invoked from OpenCode commands
- **Expandability:** new sources should be easy to add

## Decision

**Use Playwright with the `playwright-extra` stealth plugin**, Chromium browser, per-source isolated browser contexts, and conservative rate limiting. No VPN or proxy rotation at this scale.

### Alternatives considered

| Alternative | Verdict | Reason |
|---|---|---|
| `webfetch` (built-in) | **Rejected** | Cannot execute JavaScript; fails on SPA job boards |
| Raw HTTP + cheerio | **Rejected** | Only works for RSS/HTML-static sources (< 50% of boards); would need Playwright fallback anyway, doubling implementation |
| Puppeteer | **Rejected** | Playwright has better API, cross-browser support, and equivalent stealth ecosystem. Weaker auto-wait primitives |
| Playwright (bare) | **Rejected** | Detectable via `navigator.webdriver`, headless Chrome flags, and other fingerprints. Risk of silent blocking |
| Playwright + `playwright-extra` + `puppeteer-extra-plugin-stealth` | **Accepted** | Patches detectable automation fingerprints. Single dependency. Battle-tested in the scraping community |
| VPN (e.g. Mullvad) | **Deferred** | VPN exit-node IPs are often flagged. Residential/mobile proxy rotation would be needed for reliable evasion but is unnecessary at ~20 req/search volume |
| Paid API (SerpAPI, ScrapingBee) | **Rejected** | Adds recurring cost and third-party dependency for a tool that should remain self-contained. Useful as a fallback if blocking emerges |

### Anti-detection measures

1. **`puppeteer-extra-plugin-stealth`** — patches `navigator.webdriver`, `navigator.plugins`, `window.chrome`, headless user-agent, and other fingerprint targets
2. **Per-source browser context isolation** — `browser.newContext()` per job board, no shared cookies or local storage between sources
3. **Rate limiting** — minimum 3–5 seconds between page loads per domain, random 10–30% jitter added
4. **Realistic headers** — accept-language matching locale, typical viewport dimensions, `sec-ch-ua` headers set
5. **HTTP 429 backoff** — if a source returns 429, skip it for this search session; do not retry aggressively

### What we didn't adopt (and why)

- **Proxy rotation:** at < 20 requests per search session, a static residential IP is indistinguishable from normal browsing. Residential proxy services (Bright Data, Oxylabs) would be the right choice if blocking emerges, but are overkill for launch.
- **Headless: false (headed mode):** `xvfb-run` on headless CI is a viable fallback, but the stealth plugin handles headless detection well enough for job boards (which want visibility, unlike ticketing or sneaker sites).

## Consequences

- **Pro:** All job boards become readable regardless of rendering strategy
- **Pro:** Stealth plugin significantly reduces blocking risk versus bare Playwright
- **Pro:** Per-source isolation prevents cross-domain cookie correlation
- **Con:** ~500 MB Chromium download on first install
- **Con:** Page loads are slower than raw HTTP (1–3 seconds per page in headless vs milliseconds for RSS)
- **Risk:** Some job boards (notably LinkedIn) actively fight scraping. If blocking emerges, a residential proxy fallback or manual paste-to-track workflow may be needed. The `/track` command already supports pasted descriptions as a fallback

## References

- [`puppeteer-extra-plugin-stealth`](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth)
- [Playwright browser contexts](https://playwright.dev/docs/api/class-browsercontext)
- [`playwright-extra`](https://github.com/berstend/puppeteer-extra/tree/master/packages/playwright-extra)
