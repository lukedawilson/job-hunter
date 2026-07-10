# Job Hunter

Slash commands for searching jobs, applying to them, and tracking your applications — right from your terminal. Built for [OpenCode](https://opencode.ai), and easy to port to Claude Code or GitHub Copilot CLI.

## Setup

Run `/build-profile` first. It interviews you and can ingest your CV, LinkedIn, and GitHub to populate your profile. On first run, you'll be asked where to store your data (default: `./data`).

## Commands

| Command | What it does |
|---|---|
| `/build-profile [--cv <path>] [--linkedin <url>] [--github <url>]` | Interview to build your profile. Provide any inputs you have. |
| `/search <query>` | Search job boards for roles matching your profile. |
| `/track <url>` | Scrape a job listing and save it to the pipeline. |
| `/apply <id>` | Generate a tailored cover letter + tweaked CV, then mark as applied. |
| `/summarise <id or url>` | Summarise a job listing concisely from its URL or tracked ID. |
| `/pipeline` | Pipeline dashboard — see all jobs by stage and get next-action prompts. |

## Files

```
<dataPath>/
  profile.md                # Your profile (skills, experience, preferences)
  jobs.json                 # All tracked job listings (JSON array)
  applications/<id>/        # Per-job outputs
    cover-letter.md
    cv.md
  cv.pdf                    # Drop your CV here
  linkedin-export.pdf       # Drop a LinkedIn export here
docs/                       # Project documentation
  architecture/             # Architecture Decision Records
```

Your data directory is gitignored. Configure via `.jobhunterrc` (also gitignored):

```json
{
  "dataPath": "./data",
  "searchLimit": 5
}
```

- `dataPath` — where profiles, jobs, and applications live (default `./data`)
- `searchLimit` — max results to display per `/search` (default `5`). The scraper fetches generously per source; this caps the final count shown.

### Keeping your data in a private repo

Your profile, jobs, and applications are personal — keep them in a separate private repo so the tool repo stays clean and shareable:

```bash
# 1. Create a private repo on GitHub (e.g. job-hunter-data)
# 2. Inside the tool repo, initialize your data directory as a git repo:
cd data
git init
git remote add origin https://github.com/you/job-hunter-data.git
git add -A
git commit -m "Initial personal data"
git push -u origin main
```

The `data/` directory stays gitignored by the tool repo — only your private data repo tracks it. On a new machine, just `git clone` your data repo into `./data`.

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
| Y Combinator Jobs | YC startup listings |
| Remotive | Remote tech jobs |
| EuroTechJobs | EU-focused tech roles |
| Glassdoor Jobs | Broad coverage |
| Arc | Remote developer jobs |

Dynamically expand this list per search — if a relevant source is discovered mid-search, pull from it too.

## Workflow

```
  /build-profile
       │
       ▼
  /search ────▶ /track ────▶ /summarise ────▶ /apply
       ▲                        ▲    │            │
       │                        │    │            │
       │                        │    ▼            │
       │                     /pipeline ◀──────────┘
       │                        │
       └────────────────────────┘
```
