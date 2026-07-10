---
description: Interview to build your profile. Provide any inputs you have.
---

Build the user's profile via interview and optional document ingestion, then write `profile.md`.

$ARGUMENTS

## Process

1. Ask the user for their **name**, **location**, **email**, and **phone**.

2. Ask for profile links:
   - **LinkedIn** URL
   - **GitHub** URL
   - **Personal site / blog** URL

3. If `--cv <path>` was provided, read and extract skills, experience, and education from the CV.

4. If `--linkedin <url>` was provided, scrape and extract experience, skills, and summary from the LinkedIn profile.

5. If `--github <url>` was provided, extract pinned repos, languages, and contribution activity from the GitHub profile.

6. Ask about:
   - **Skills**: technical (languages, frameworks, tools), agentic engineering, soft skills. Map to proficiency levels.
   - **Experience**: roles, companies, dates, key achievements. For each role, capture tech stack.
   - **Education**: degree, institution, year.
   - **Preferences**: target role titles, industries (and dealbreakers), employment type, work model, location, salary range, company size.

7. Compile everything into `profile.md` using this structure:
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

8. Write `profile.md`. Present a summary of what was captured and ask the user to review.
