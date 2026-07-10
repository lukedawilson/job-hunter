---
description: Search for jobs matching the user's profile
---

Search for jobs matching the user's profile and any additional keywords provided.

User query: $ARGUMENTS

## Process

1. Read `profile.md` to understand the user's target roles, skills, location, employment type, work model, and salary expectations.

2. Build a combined search query from the user's target role titles and any `$ARGUMENTS` keywords.

3. Run the Playwright scraper against each relevant source. Spawn them in parallel with rate limiting between sources:

   ```bash
   node scripts/scrape.js --source remoteok --query "senior engineer remote"
   node scripts/scrape.js --source weworkremotely --query "principal engineer"
   node scripts/scrape.js --source hnews --query "c# engineer"
   node scripts/scrape.js --source ycombinator --query "agentic engineer"
   ```

   Run at least 3-4 sources per search. Vary the query per source — some boards use keyword search, others browse. Add new sources if discovered mid-search.

4. For sources not in the scraper (LinkedIn, Indeed, Glassdoor), construct search URLs and use `webfetch` or `node scripts/scrape.js` as appropriate. If a source blocks or returns nothing, skip it — don't retry.

5. Merge and deduplicate results (by URL). Filter against the user's preferences from `profile.md`:
   - **Work model**: if user wants remote-only, skip onsite roles.
   - **Employment type**: if user wants contract/B2B only, skip perm roles unless unclear.
   - **Location**: only show roles matching target locations or tagged "Remote".
   - **Salary**: if visible and well below the user's minimum, flag it ⚠ but still show.
   - **Dealbreakers**: skip roles with dealbreaker tech stacks (Ruby on Rails, Java), industries (gambling, military, dating, crypto), or agency roles.

6. Present results as a numbered table:

   ```
   | # | Title | Company | Location | Remote? | Salary | Source |
   |---|-------|---------|----------|---------|--------|--------|
   | 1 | ...   | ...     | ...      | ...     | ...    | ...    |
   ```

7. Below the table, show a brief summary of each role (1-2 lines). Flag low-salary or dealbreaker-adjacent roles.

8. Ask: "Track any of these? Give me numbers or 'none'."

   If the user gives numbers, run `/track <url>` for each selected job. If the URL wasn't captured from the scraper, ask the user to paste it.

   If no results or poor matches, try broader queries or additional sources before giving up.
