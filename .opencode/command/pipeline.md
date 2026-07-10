---
description: Show application pipeline dashboard with status and next actions
---

Display a dashboard of all tracked job applications and flag any needing action.

## Process

1. Read `.jobhunterrc` to get the data path. Default to `./data` if not set.

2. Read `<dataPath>/jobs.json`.

2. If empty: "No tracked jobs yet. Run `/find` to search and `/track <url>` to save listings."

3. Group jobs by status and display each group:

```
## Saved (X jobs)
| # | Company | Title | Saved | Link |
|---|---------|-------|-------|------|
| 1 | Acme    | Sr Eng | 3d ago | [Job](https://...) |

## Applying (X jobs)
...

## Applied (X jobs)
| # | Company | Title | Applied | Waiting | Link |
|---|---------|-------|---------|---------|------|
| 3 | Beta    | Lead   | 5d ago  | 5 days  | [Job](https://...) |
```

4. **Warnings** — flag issues at the top:
   - Jobs in `saved` for >7 days: "These jobs are getting stale — apply soon"
   - Jobs in `applied` for >14 days with no follow-up: "Consider following up on these"

5. **Next actions** section: suggest concrete next steps based on the pipeline state.
   - If nothing in `applying` or recently tracked: "Run `/find` to discover new roles."
   - If jobs in `saved`: "Run `/apply <id>` to prepare materials for these."
   - If >5 in `applied` with no interviews: "Review your CV and cover letter approach — low response rate."

6. At the end, ask if the user wants to update any job statuses (e.g. mark an interview, offer, or rejection).
