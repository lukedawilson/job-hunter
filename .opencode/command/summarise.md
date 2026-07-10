---
description: Summarise a job listing — pass a job ID or URL
---

Summarise a job listing concisely. Accepts a job ID from `jobs.json` or a raw URL.

Input: $ARGUMENTS

## Process

1. If the input matches a job ID in `jobs.json` (check the `id` field), fetch from that job's `url`. Otherwise treat the input as a URL directly.

2. Fetch the URL with `webfetch`. If it returns empty/skeleton content, fall back to the stored `description` in `jobs.json` (if from a tracked job).

3. From the content, extract and display a concise summary:

```
## <Company> — <Title>

**Location:** <location>
**Salary:** <salary or "Not listed">
**Type:** <full-time/contract/etc if discernible>

### Role
<1-2 sentence summary of what the role does>

### Requirements
<bullet list of key requirements — tools, experience, skills>

### Nice to have
<bullet list if mentioned>

### Company
<1 sentence on what the company does>

### Keywords
<comma-separated tags: tech stack, domains, seniority>
```

4. If the job is already tracked in `jobs.json`, also show its current pipeline status and dates.
