# AGENTS

Job Hunter is an OpenCode-powered job hunting toolkit. Commands run from `.opencode/command/*.md`, backed by a user profile and application pipeline stored in a configurable data directory (default `./data`). The data path is stored in `.jobhunterrc`.

## ADRs

Architecture decisions live in `docs/architecture/decisions/`. Read them before making structural changes. Format follows Michael Nygard's template:

- `# N. <decision>`
- `## Status` (Accepted / Superseded by NNNN)
- `## Context` — problem, alternatives, constraints
- `## Decision` — what we chose and the decisive factor
- `## Consequences` — trade-offs, follow-ups, risks
- `## References` — PRs, files, external docs

Before adding a dependency, changing the data model, or altering the scraping approach, write an ADR.

## Project conventions

- **Commands:** markdown files in `.opencode/command/` with YAML frontmatter (`description:`). Use `$ARGUMENTS` for user input.
- **Data path:** stored in `.jobhunterrc` (JSON: `{"dataPath": "./data"}`). Always read before accessing data files. Default to `./data` if the file is missing.
- **Data files:** `<dataPath>/jobs.json` — JSON array of tracked job entries. `<dataPath>/profile.md` — the user's profile in markdown.
- **Applications:** per-job outputs go in `<dataPath>/applications/<job-id>/` (cover-letter.md, cv.md).
- **Config:** `.jobhunterrc` and the data directory are gitignored. Each user maintains their own.
- **Dependencies:** root `package.json` for tool dependencies (Playwright, etc.). `.opencode/package.json` is for the OpenCode plugin runtime only (gitignored).
- **Scraping:** use Playwright + stealth. See ADR 0001. Rate limit, isolate contexts per source.
- **No comments:** don't add comments to code files unless asked.
- **Commit only when asked.**
