---
description: Generate a tailored cover letter and CV tweaks for a job, then mark it as applied.
---

Generate a tailored cover letter and CV tweaks for a specific job, then mark it as applied.

Job ID: $ARGUMENTS

## Process

1. Read `jobs.json` and find the job with the given ID. If not found, list available job IDs and ask which one.
2. Read `profile.md` for the user's skills, experience, and preferences.

3. **Cover letter**: Write a tailored cover letter saved to `applications/<id>/cover-letter.md`.
   - Address the hiring manager (use "Hiring Manager" if name unknown)
   - Opening: which role you're applying for and why you're excited
   - Body: map your specific experience to their requirements — use concrete examples from your profile that match the job description
   - Closing: call to action, availability for interview
   - Keep it concise (250-350 words)

4. **CV tweaks**: Output a bullet list of specific, actionable changes to the base CV in `profile.md`. Show these in the terminal — do NOT write a file. Each delta should be concrete enough to apply immediately:
   - "Reorder: move [role] to the top of Experience"
   - "Emphasise: add [skill/keyword] to Summary"
   - "Add keyword: [term] to [section]"
   - "Trim: remove or shrink [role] — less relevant to this job"
   - Do NOT fabricate experience — only reorder, emphasise, or rephrase what's in the profile

5. Ask the user: "Mark this job as applied? (y/n)" before updating `jobs.json`. Only update if they confirm.

6. If confirmed, change the job's status to `"applied"` and set `dates.applied` to today's date. Then present: "Cover letter ready in `applications/<id>/`. Job marked as applied. Run `/pipeline-status` to see your pipeline."
