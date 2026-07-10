---
description: Prepare a tailored cover letter and CV for a tracked job
---

Generate a tailored cover letter and tweaked CV for a specific job, then mark it as applied.

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

4. **CV tweak**: Create a version of the CV saved to `applications/<id>/cv.md`.
   - Start from the base CV / experience in `profile.md`
   - Reorder and emphasise skills/experience most relevant to this role
   - Add keywords from the job description naturally
   - Do NOT fabricate experience — only reorder and rephrase what's in the profile

5. **Update job status**: Change the job's status to `"applied"` and set `dates.applied` to today's date in `jobs.json`.

6. Present a summary: "Cover letter and tweaked CV ready in `applications/<id>/`. Job marked as applied. Run `/status` to see your pipeline."
