---
description: Inspect the application form and draft tailored answers.
---

Inspect the job's application form and draft tailored answers. Fall back to a cover letter only if the form can't be inspected.

Job ID: $ARGUMENTS

## Process

1. Read `.jobhunterrc` to get the data path. Default to `./data` if not set.

2. Read `<dataPath>/jobs.json` and find the job with the given ID. If not found, list available job IDs and ask which one.
3. Read `<dataPath>/profile.md` for the user's skills, experience, and preferences.

4. **Quick copy**: Output these profile links for easy copy-paste into application forms:
   - LinkedIn: (from `<dataPath>/profile.md`)
   - GitHub: (from `<dataPath>/profile.md`)
   - Personal site / blog: (from `<dataPath>/profile.md`)

5. **Inspect the application form**: Fetch the job URL with a headless browser (Playwright). Look for:
   - An "Apply" button or link — click it if found, then inspect the resulting form/modal/page.
   - Any custom questions the form asks (e.g. "Tell me about a time when...", "Why do you want to work here?", "What's your salary expectation?", "Describe your experience with X", etc.).
   - Whether a cover letter upload or text field is explicitly requested.
   - Other notable fields: visa requirements, start date, referral source, portfolio links.

6. **Draft answers**: For each custom question found, draft a concise, specific answer drawing from the user's profile. Save all answers to `<dataPath>/applications/<id>/application-answers.md`. Match the company's tone. Be honest — don't fabricate experience. Keep each answer to 2-4 sentences unless the question clearly demands more.

7. **Cover letter (conditional)**: Only write a cover letter if:
   - The application form explicitly asks for one, OR
   - You were unable to inspect the form (e.g. blocked by auth wall).
               If written, save to `<dataPath>/applications/<id>/cover-letter.md`. Address the hiring manager, map specific experience to the role, keep it 250-350 words.

8. **CV suitability check**: Decide if the base CV in `<dataPath>/profile.md` is a good fit for this role. If it is, say: "CV is suitable for this role — no changes needed." If it isn't, flag it plainly: "CV is a poor match for this role — [one sentence explaining why]."

   You may suggest 1-3 tweaks only if this role is genuinely different from the user's typical target roles and warrants special attention (e.g. it's a Rust role in an otherwise TypeScript/C# profile, or it asks for a niche skill the user has but hasn't surfaced). Do not suggest tweaks for routine applications — the base CV is tuned for the user's target roles already.

9. **Summary**: Present what was found and created, including the job title, company, and URL. Ask: "Mark this job as applied? (y/n)". Only update `<dataPath>/jobs.json` if they confirm.

10. If confirmed, change the job's status to `"applied"` and set `dates.applied` to today's date. Then present: "Application materials ready in `<dataPath>/applications/<id>/`. Job marked as applied. Run `/pipeline` to see your pipeline."
