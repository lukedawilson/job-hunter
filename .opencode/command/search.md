---
description: Search for jobs matching the user's profile
---

Search for jobs matching the user's profile and any additional keywords provided.

User query: $ARGUMENTS

## Process

1. Read `.jobhunterrc` to get the data path. Default to `./data` if not set.

2. Read `<dataPath>/profile.md` to understand the user's target roles, skills, location, employment type, work model, and salary expectations.

3. Build a combined search query from the user's target role titles and any `$ARGUMENTS` keywords.

4. For each source, read its `meta` from `scripts/sites/<name>.js` to determine:
   - **Pagination:** if `meta.paginates` is true, use `--pages <meta.defaultPages>` (20). Otherwise use `--pages 1`.
   - **Query:** use `meta.suggestedQuery` or build from the user's target roles.
   - **Location handling:** `meta.locationHint` tells you how to interpret results. `us_biased` means the source defaults to US remote — verify via detail page fetch. `worldwide` means listed as remote = actually worldwide. `check_listing` means you must check the listing page for country.

    Run all sources in parallel with `--limit 30`, each writing to a temp file:

    ```bash
    node scripts/scrape.js --source <name> --query "<query>" --limit 30 --pages <N> > /tmp/jh_search_<name>.json &
    ```

    After all scrapers finish (`wait`), merge, deduplicate, and filter:

    ```bash
    node scripts/filter-jobs.js --profile <dataPath>/profile.md /tmp/jh_search_*.json
    ```

    The script outputs JSON with `results`, `flags`, and `stats`. Do not manually count or filter — use the script output.

5. The filter-jobs script has already handled:
   - Merge + deduplicate by URL
   - Remove onsite/hybrid (unless also "remote")
   - Filter US-geolocked jobs from us_biased sources
   - Flag us_biased "Remote" jobs for manual verification
   - Flag unverifiable jobs from paywalled sources for ATS cross-check (see step 6)

   Review the script's `results` array (already pre-filtered) and apply additional profile checks the script cannot do from the thin scraper output:

   Apply these remaining filters against `<dataPath>/profile.md`:
   - **Dealbreakers:** skip roles mentioning dealbreaker stacks (Ruby on Rails, Java), industries (gambling, military, dating, crypto), or agencies.
   - **Employment type:** skip roles that don't match if discernible from the title/location.
   - **Salary:** flag if well below the user's minimum from `<dataPath>/profile.md`.

6. **Country eligibility pass** — every shortlisted job MUST be verified for country scope before presenting. "Remote" on Indeed is US-biased; YC/WWR roles are often on-site or US-citizen-only. Skip any role that is US-only, on-site outside the user's region, or otherwise not eligible from the user's location (profile.md `location` + remote-only work model).

   **Indeed jobs** — fetch the detail page with Playwright (write the script inside the project dir so node resolves deps, delete after):

   ```js
   const { chromium } = require("playwright-extra");
   const stealth = require("puppeteer-extra-plugin-stealth")();
   chromium.use(stealth);
   // navigate to the job's clk URL (works better than a bare viewjob URL), wait ~5s, then:
   // 1. Read all <script type="application/ld+json"> tags. If any jobLocation.address.addressCountry === "US" → US-only, drop.
   // 2. Also grep body innerText for explicit location lines like "Remote (U.S.)", "Remote US", "Remote U.S."
   ```

   **Y Combinator jobs** — `webfetch` the job URL. The page shows `Location` and `Visa` fields:
   - `Visa: US citizen/visa only` or a US location (New York, San Francisco, Mountain View, etc.) → drop.
   - Location outside the user's region (e.g. "Bengaluru, India") → drop.
   - Body text stating on-site/in-person ("in-person role", "sits in the same room", "willing to relocate") → drop.
   - `Visa: US citizenship/visa not required` + user-region location = eligible.

   **We Work Remotely / Remote OK / Remotive** — `webfetch` the listing; the region tag must be "Anywhere in the World" or include the user's region. Grafana-style postings list explicit eligible countries ("UK, Germany, Spain, Ireland and Sweden") — if the user's country is not listed, surface it rather than silently keeping.

   **ATS cross-check (mandatory for check_listing sources)** — boards like WWR let employers tag location loosely: a listing can say "Anywhere in the World" while the employer's own ATS restricts to the US. For every shortlisted job from a `check_listing` source (and every job flagged as unverifiable by filter-jobs), find the employer's own ATS posting before presenting:
   - Greenhouse: `curl -s "https://boards-api.greenhouse.io/v1/boards/<company-slug>/jobs?content=true"` (public JSON, no auth). Match by title, read `location.name`. "Remote - US" or a list of US states = drop.
   - Lever: `https://api.lever.co/v0/postings/<company-slug>?mode=json`. Ashby: `https://api.ashbyhq.com/posting-api/job-board/<company-slug>`. Workable: `https://apply.workable.com/api/v3/accounts/<company-slug>/jobs`.
   - The company slug is usually the lowercase company name without spaces or punctuation.
   - If the ATS posting restricts to the US or excludes the user's region, drop the job. If no ATS posting is found, keep the job and flag it as unverified in the summary.

7. Present results as a numbered table:

   ```
   | # | Title | Company | Location | Remote? | Salary | Source | Link |
   |---|-------|---------|----------|---------|--------|--------|------|
   | 1 | ...   | ...     | ...      | ...     | ...    | ...    | [Job](https://...) |
   ```

8. Below the table, show a brief summary of each role (1-2 lines). Flag low-salary or dealbreaker-adjacent roles.

9. Ask: "Track any of these? Give me numbers or 'none'."

   If the user gives numbers, run `/track <url>` for each selected job. If the URL wasn't captured from the scraper, ask the user to paste it.

   If no results or poor matches, try broader queries or additional sources before giving up.
