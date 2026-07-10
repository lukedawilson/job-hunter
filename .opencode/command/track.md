---
description: Track a job by scraping its listing URL
---

Save a job listing to `jobs.json` for tracking through the application pipeline.

URL: $ARGUMENTS

## Process

1. First try `webfetch` on the URL. If the result contains the job description, use it.

2. If webfetch returns empty/skeleton content (JS-rendered page), use Playwright with stealth:

   ```bash
   node -e "
   const { chromium } = require('playwright-extra');
   const stealth = require('puppeteer-extra-plugin-stealth')();
   chromium.use(stealth);
   (async () => {
     const browser = await chromium.launch({ headless: true });
     const ctx = await browser.newContext();
     const page = await ctx.newPage();
     await page.goto('$ARGUMENTS', { waitUntil: 'domcontentloaded', timeout: 15000 });
     await new Promise(r => setTimeout(r, 2000));
     const text = await page.evaluate(() => document.body.innerText);
     console.log(text);
     await ctx.close();
     await browser.close();
   })();
   "
   ```

3. From the extracted text, identify: title, company, location, description, salary (if present).

4. Generate a slug ID from company + title: lowercase, hyphens, no special chars. e.g. `acme-senior-engineer`.

5. Check `jobs.json` — if a job with this ID already exists, warn the user and ask if they want to update it.

6. Build the job entry and append to the `jobs.json` array:

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

7. Confirm: "Tracked: **[Company] — [Title]**. Run `/apply [id]` when you're ready."

If both webfetch and Playwright fail (bot block, 403, etc.), tell the user and ask them to paste the job description manually.
