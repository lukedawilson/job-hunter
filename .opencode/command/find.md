---
description: Search for jobs matching the user's profile
---

Search for jobs matching the user's profile and any additional keywords provided.

User query: $ARGUMENTS

## Process

1. Read `profile.md` to understand the user's target roles, skills, location, and preferences.

2. Search across multiple job boards. Try these in order, stop when you have a good set of results (10-15):
   - **LinkedIn Jobs**: `https://www.linkedin.com/jobs/search/?keywords={query}&location={location}`
   - **Indeed**: `https://uk.indeed.com/jobs?q={query}&l={location}` (or .com if US)
   - **Google Jobs**: construct a search and fetch results
   - **Workable**: `https://jobs.workable.com/` with search params

3. For each job found, extract: title, company, location, salary (if visible), brief description, and URL.

4. Present results as a numbered table:

```
| # | Title | Company | Location | Salary | 
|---|-------|---------|----------|--------|
| 1 | ...   | ...     | ...      | ...    |
```

5. Below the table, show a brief summary of each role (1-2 lines).

6. Ask: "Track any of these? Give me numbers or 'none'."

If the user gives numbers, run `/track` for each selected job URL (tell the user to do this manually, or if the URL was captured, offer to add them directly to `jobs.json`).

If no results or poor matches, try broader searches or different boards before giving up.
