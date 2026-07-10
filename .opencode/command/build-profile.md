---
description: Interview the user to build a comprehensive profile for job hunting
---

Your job is to populate `profile.md` with everything needed for effective job hunting. You are interviewing the user interactively.

## Input sources

The user may have passed arguments: $ARGUMENTS
Accept these flags:
- `--cv <path>` — path to a CV/resume file. Read it and extract all relevant info.
- `--linkedin <url>` — LinkedIn profile URL. Ask the user to copy-paste the content since LinkedIn blocks automated fetching.
- `--github <url>` — GitHub profile URL. Fetch it via webfetch to extract repos, languages, and bio.

If any are missing, ask the user if they want to provide them now. Do NOT require them — some users won't have all three.

## Interview process

Work through the sections below. Ask questions conversationally, not all at once. For each section, first extract what you can from the provided inputs (CV, GitHub, LinkedIn paste), then ask targeted follow-ups to fill gaps.

### 1. Personal
- Full name, location, email, phone
- LinkedIn, GitHub, portfolio URLs

### 2. Skills
- Technical skills with rough proficiency (expert/proficient/familiar)
- Tools, frameworks, languages, platforms
- Soft skills

### 3. Experience
- For each role: company, title, dates, 2-4 bullet achievements
- Extract from CV if provided; ask for highlights

### 4. Education
- Degrees, institutions, years
- Notable certifications

### 5. Preferences
- Target role titles (be specific)
- Industries of interest
- Employment type: employee (perm), contractor, B2B contract, or open to any
- Work model: remote, hybrid, onsite
- Current location (city/country)
- Where you're willing to work (specific cities, countries, or "remote anywhere")
- Salary expectation: range, currency (GBP/USD/EUR/etc.)
- Company size preference (startup / mid / large)
- Any dealbreakers (e.g. no defence, no crypto, no agencies)

## Writing the file

After the interview, write a clean, well-structured `profile.md`. Use the existing template structure in the file. Make sure every section has real content — replace the placeholder text. Confirm with the user before writing.
