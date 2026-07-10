---
description: Interview to build your profile. Provide any inputs you have.
---

Build the user's profile via interview and optional document ingestion. Sets up the data path on first run, then writes the profile.

$ARGUMENTS

## Process

1. First run setup: if `.jobhunterrc` doesn't exist, ask the user where to store job data. Default: `./data`. Create `.jobhunterrc`:
   ```json
   {"dataPath": "./data"}
   ```
   Create the data directory and `data/applications/` if missing.

2. Read `.jobhunterrc` to determine the data path (`dataPath`). All file paths below are relative to this.

3. Ask the user for their **name**, **location**, **email**, and **phone**.

4. Ask for profile links:
   - **LinkedIn** URL
   - **GitHub** URL
   - **Personal site / blog** URL

5. If `--cv <path>` was provided, read and extract skills, experience, and education from the CV.

6. If `--linkedin <url>` was provided, scrape and extract experience, skills, and summary from the LinkedIn profile.

7. If `--github <url>` was provided, extract pinned repos, languages, and contribution activity from the GitHub profile.

8. Ask about:
   - **Skills**: technical (languages, frameworks, tools), agentic engineering, soft skills. Map to proficiency levels.
   - **Experience**: roles, companies, dates, key achievements. For each role, capture tech stack.
   - **Education**: degree, institution, year.
   - **Preferences**: target role titles, industries (and dealbreakers), employment type, work model, location, salary range, company size.

9. Compile everything into `<dataPath>/profile.md` using this structure:
   ```markdown
   # Profile

   ## Personal
   - Name:
   - Location:
   - Email:
   - Phone:
   - LinkedIn:
   - GitHub:
   - Blog:

   ## Summary
   (2-3 sentence summary)

   ## Skills
   ### Technical
   (table: Skill | Proficiency)

   ### Agentic Engineering
   (bullet list)

   ### Soft
   (bullet list)

   ## Experience
   (reverse chronological, each with: role, company, location, dates, bullets, tech stack)

   ## Education
   (degree, institution, year)

   ## Preferences
   (role titles, industries, employment type, work model, location, salary range, company size, dealbreakers, focus areas)
   ```

10. Write `<dataPath>/profile.md`. Present a summary of what was captured and ask the user to review.
