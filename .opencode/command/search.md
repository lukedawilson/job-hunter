---
description: Search for jobs matching the user's profile
---

Search for jobs matching the user's profile and any additional keywords provided.

User query: $ARGUMENTS

## Process

1. Read `.jobhunterrc` to get the data path. Default to `./data` if not set.

2. Read `<dataPath>/profile.md` to understand the user's target roles, skills, location, employment type, work model, and salary expectations.

3. Build a combined search query from the user's target role titles and any `$ARGUMENTS` keywords.

4. Run the Playwright scraper against each relevant source. Spawn them in parallel. Use `--limit 30` for all sources. Use `--pages 20` only for sources that support real pagination (WWR via `?page=N`, YC via scroll, Indeed via `&start=N`). Use `--pages 1` for sources that return all results at once (RemoteOK, Remotive, EuroTechJobs, Arc):

   ```bash
   node scripts/scrape.js --source remoteok --query "senior staff principal engineer" --limit 30 --pages 1
   node scripts/scrape.js --source weworkremotely --query "engineer" --limit 30 --pages 20
   node scripts/scrape.js --source ycombinator --query "software engineer" --limit 30 --pages 20
   node scripts/scrape.js --source indeed --query "senior staff principal lead engineer" --limit 30 --pages 20
   node scripts/scrape.js --source remotive --query "senior staff principal" --limit 30 --pages 1
   node scripts/scrape.js --source eurotechjobs --query "senior principal c# dotnet" --limit 30 --pages 1
   node scripts/scrape.js --source arc --query "senior staff principal" --limit 30 --pages 1
   ```

   If a source returns few results, try a broader query or a different category page and re-run.

5. Merge and deduplicate results (by URL). Filter against the user's preferences from `<dataPath>/profile.md`:
   - **Work model**: if user wants remote-only, skip onsite/hybrid roles.
   - **Location**: skip US-geolocked roles. On Indeed and similar boards, "Remote" typically means "Remote in US" — these are dealbreakers unless the listing explicitly mentions worldwide, Europe, EMEA, or the user's target countries. On WWR and YC, check the actual location field per listing.
   - **Employment type**: if user wants contract/B2B only, skip perm roles unless unclear.
   - **Salary**: if visible and well below the user's minimum, flag it but still show.
   - **Dealbreakers**: skip roles with dealbreaker tech stacks (Ruby on Rails, Java), industries (gambling, military, dating, crypto), or agency roles.

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
