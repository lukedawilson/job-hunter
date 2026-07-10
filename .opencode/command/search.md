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

   Review the script's `results` array (already pre-filtered) and apply additional profile checks the script cannot do from the thin scraper output. For any `flags`, fetch the detail page for us_biased "Remote" jobs to verify worldwide eligibility.

   Apply these remaining filters against `<dataPath>/profile.md`:
   - **Dealbreakers:** skip roles mentioning dealbreaker stacks (Ruby on Rails, Java), industries (gambling, military, dating, crypto), or agencies.
   - **Employment type:** skip roles that don't match if discernible from the title/location.
   - **Salary:** flag if well below the user's minimum from `<dataPath>/profile.md`.

6. Present results as a numbered table:

   ```
   | # | Title | Company | Location | Remote? | Salary | Source | Link |
   |---|-------|---------|----------|---------|--------|--------|------|
   | 1 | ...   | ...     | ...      | ...     | ...    | ...    | [Job](https://...) |
   ```

7. Below the table, show a brief summary of each role (1-2 lines). Flag low-salary or dealbreaker-adjacent roles.

8. Ask: "Track any of these? Give me numbers or 'none'."

   If the user gives numbers, run `/track <url>` for each selected job. If the URL wasn't captured from the scraper, ask the user to paste it.

   If no results or poor matches, try broader queries or additional sources before giving up.
