# Job Hunter

OpenCode-powered job hunting toolkit. Commands that build your profile, find jobs, and prepare tailored applications — all persisted as markdown and JSON in this repo.

## Setup

Run `/build-profile` first. It interviews you and can ingest your CV, LinkedIn, and GitHub to populate `profile.md`.

## Commands

| Command | What it does |
|---|---|
| `/build-profile [--cv <path>] [--linkedin <url>] [--github <url>]` | Interview to build your profile. Provide any inputs you have. |
| `/find <query>` | Search job boards for roles matching your profile. |
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
docs/                       # Supporting documents (gitignored)
  cv.pdf                    # Drop your CV here
  linkedin-export.pdf       # Drop a LinkedIn export here
```

## Workflow

1. `/build-profile` — one-time setup
2. `/find senior engineer remote` — discover roles
3. `/track https://example.com/job/123` — save interesting ones
4. `/apply acme-senior-engineer` — generate materials
5. `/status` — keep on top of your pipeline
