---
description: Search for jobs matching the user's profile
---

Search for jobs matching the user's profile and any additional keywords provided.

User query: $ARGUMENTS

## Process

1. Read `profile.md` to understand the user's target roles, skills, location, employment type, work model, and salary expectations.

2. Construct searches per target location from the profile. For each location, search across multiple job boards. Try these, stop when you have a good set of results (10-15):
   - **LinkedIn Jobs**: `https://www.linkedin.com/jobs/search/?keywords={query}&location={location}`
   - **Indeed**: `https://uk.indeed.com/jobs?q={query}&l={location}` (or .com if US)
   - **Google Jobs**: construct a search and fetch results
   - **Workable**: `https://jobs.workable.com/` with search params

3. For each job found, extract: title, company, location, remote/hybrid/onsite, salary (if visible), employment type (if visible), brief description, and URL.

4. Filter results against the user's preferences from `profile.md`:
   - **Work model**: if user wants remote-only, skip onsite roles. If hybrid, match accordingly.
   - **Employment type**: if user wants B2B/contract only, skip perm roles (and vice versa). If "open", include all.
   - **Location**: only show roles in the user's target locations (or "remote" roles if applicable).
   - **Salary**: if a salary is visible and it's well below the user's minimum, flag it but still show it (marked ⚠).

5. Present results as a numbered table:

```
| # | Title | Company | Location | Type | Remote? | Salary | 
|---|-------|---------|----------|------|---------|--------|
| 1 | ...   | ...     | ...      | ...  | ...     | ...    |
```

6. Below the table, show a brief summary of each role (1-2 lines). If any were flagged for low salary, note them.

6. Ask: "Track any of these? Give me numbers or 'none'."

If the user gives numbers, run `/track` for each selected job URL (tell the user to do this manually, or if the URL was captured, offer to add them directly to `jobs.json`).

If no results or poor matches, try broader searches or different boards before giving up.
