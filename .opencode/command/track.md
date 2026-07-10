---
description: Track a job by scraping its listing URL
---

Save a job listing to `jobs.json` for tracking through the application pipeline.

URL: $ARGUMENTS

## Process

1. Fetch the URL with webfetch to get the job description, title, company, and any other details.

2. Generate a slug ID from company + title: lowercase, hyphens, no special chars. e.g. `acme-senior-engineer`.

3. Check `jobs.json` — if a job with this ID already exists, warn the user and ask if they want to update it.

4. Build the job entry and append to the `jobs.json` array:

```json
{
  "id": "company-role-slug",
  "url": "<original url>",
  "title": "Job Title",
  "company": "Company Name",
  "location": "Location if found",
  "description": "Full job description text",
  "status": "saved",
  "salary": "if mentioned",
  "dates": {
    "saved": "<today>",
    "applied": null,
    "last_contact": null,
    "next_step": null
  },
  "notes": ""
}
```

5. Confirm with the user: "Tracked: **[Company] — [Title]**. Run `/apply [id]` when you're ready to prepare application materials."

If the webfetch fails (JavaScript-rendered page, bot block), tell the user and ask them to paste the job description manually.
