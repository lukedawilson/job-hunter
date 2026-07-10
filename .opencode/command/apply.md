---
description: Inspect the application form and draft tailored answers.
---

Inspect the job's application form and draft tailored answers. Fall back to a cover letter only if the form can't be inspected.

Job ID: $ARGUMENTS

## Process

1. Read `jobs.json` and find the job with the given ID. If not found, list available job IDs and ask which one.
2. Read `profile.md` for the user's skills, experience, and preferences.

3. **Quick copy**: Output these profile links for easy copy-paste into application forms:
   - LinkedIn: (from `profile.md`)
   - GitHub: (from `profile.md`)
   - Personal site / blog: (from `profile.md`)

4. **Inspect the application form**: Fetch the job URL with a headless browser (Playwright). Look for:
   - An "Apply" button or link — click it if found, then inspect the resulting form/modal/page.
   - Any custom questions the form asks (e.g. "Tell me about a time when...", "Why do you want to work here?", "What's your salary expectation?", "Describe your experience with X", etc.).
   - Whether a cover letter upload or text field is explicitly requested.
   - Other notable fields: visa requirements, start date, referral source, portfolio links.

5. **Draft answers**: For each custom question found, draft a concise, specific answer drawing from the user's profile. Save all answers to `applications/<id>/application-answers.md`. Match the company's tone. Be honest — don't fabricate experience. Keep each answer to 2-4 sentences unless the question clearly demands more.

6. **Cover letter (conditional)**: Only write a cover letter if:
   - The application form explicitly asks for one, OR
   - You were unable to inspect the form (e.g. blocked by auth wall).
   If written, save to `applications/<id>/cover-letter.md`. Address the hiring manager, map specific experience to the role, keep it 250-350 words.

7. **CV tweaks**: Output a bullet list in the terminal — do NOT write a file. Each delta should be concrete enough to apply immediately:
   - "Reorder: move [role] to the top of Experience"
   - "Emphasise: add [skill/keyword] to Summary"
   - "Add keyword: [term] to [section]"
   - "Trim: remove or shrink [role] — less relevant to this job"
   - Do NOT fabricate experience — only reorder, emphasise, or rephrase what's in the profile

8. **Summary**: Present what was found and created. Ask: "Mark this job as applied? (y/n)". Only update `jobs.json` if they confirm.

9. If confirmed, change the job's status to `"applied"` and set `dates.applied` to today's date. Then present: "Application materials ready in `applications/<id>/`. Job marked as applied. Run `/pipeline-status` to see your pipeline."
