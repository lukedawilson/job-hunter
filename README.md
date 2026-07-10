# Job Hunter

OpenCode-powered job hunting toolkit. Commands that build your profile, find jobs, and prepare tailored applications — all persisted as markdown and JSON in this repo.

## Setup

Run `/build-profile` first. It interviews you and can ingest your CV, LinkedIn, and GitHub to populate `profile.md`.

## Commands

| Command | What it does |
|---|---|
| `/build-profile [--cv <path>] [--linkedin <url>] [--github <url>]` | Interview to build your profile. Provide any inputs you have. |
| `/search <query>` | Search job boards for roles matching your profile. |
| `/track <url>` | Scrape a job listing and save it to the pipeline. |
| `/apply <id>` | Generate a tailored cover letter + tweaked CV, then mark as applied. |
| `/status` | Pipeline dashboard — see all jobs by stage and get next-action prompts. |

## Files

```
profile.md                  # Your profile (skills, experience, preferences)
jobs.json                   # All tracked job listings (JSON array)
applications/<id>/          # Per-job outputs
  cover-letter.md
  cv.md
docs/                       # Supporting documents
  cv.pdf                    # Drop your CV here
  linkedin-export.pdf       # Drop a LinkedIn export here
```

## Sources

The `/search` command draws from these sources and expands as needed:

| Source | Notes |
|---|---|
| LinkedIn Jobs | Manual scrape or pasted URLs |
| Indeed | RSS-based search |
| Wellfound (AngelList) | Startup-focused |
| Hacker News "Who is hiring?" | Monthly threads |
| Remote OK | Remote-only listings |
| We Work Remotely | Remote-only listings |
| Glassdoor Jobs | Broad coverage |
| Y Combinator Jobs | YC startup listings |
| Arc | Remote developer jobs |
| Remotive | Remote tech jobs |
| European Tech Jobs | EU-focused tech roles |

Dynamically expand this list per search — if a relevant source is discovered mid-search, pull from it too.

## Workflow

1. `/build-profile` — one-time setup
2. `/search senior engineer remote` — discover roles
3. `/track https://example.com/job/123` — save interesting ones
4. `/apply acme-senior-engineer` — generate materials
5. `/status` — keep on top of your pipeline
