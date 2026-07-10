---
description: Add a job to the pipeline from a URL, checking against profile for issues
---

Add a job listing to the pipeline by scraping its URL, flagging dealbreakers and concerns against the user's profile before confirming.

URL: $ARGUMENTS

## Process

1. Read `.jobhunterrc` to get the data path. Default to `./data` if not set.

2. Read `<dataPath>/profile.md` to understand the user's target roles, skills, location, employment type, work model, salary expectations, and dealbreakers.

3. Attempt to scrape the job listing. Try webfetch first. If it returns a login wall or empty content, use Playwright:

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
   " 2>/dev/null
   ```

   If Playwright also hits a login wall or the job listing can't be viewed without authentication, ask the user to paste the job description manually.

4. From the extracted text, identify: title, company, location, description, salary, employment type, and any explicit country/visa requirements.

5. **Flag issues** — check the job against the user's profile and list concerns:
   - US-only or geolocked location? Flag it.
   - Dealbreaker tech stack (Ruby on Rails, Java)? Flag it.
   - Salary below target? Flag it with the shortfall.
   - Dealbreaker industry (gambling, military, dating, crypto)? Flag it.
   - Agency role? Flag it.
   - On-site/hybrid when user wants remote? Flag it.
   - Equity-only / no salary? Flag it.
   - Title mismatch (e.g. mid-level when user targets Staff/Principal)? Flag it.

6. Show a confirmation prompt:

   ```
   ## <Company> — <Title>

   Location: <location>
   Salary: <salary>
   Type: <employment type>

   ### Issues flagged
   - <issue 1>
   - <issue 2>

   ### Description (first 300 chars)
   <snippet>

   Add to pipeline? (yes/no)
   ```

7. If confirmed, generate a slug ID from company + title, build the entry, and append to `<dataPath>/jobs.json` with status `saved`. Confirm with the ID.

8. If the user says no, ask if they want to save it anyway with a reason note, or discard.
