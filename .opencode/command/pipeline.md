---
description: Show application pipeline dashboard with status and next actions
---

Display a dashboard of all tracked job applications and flag any needing action.

## Process

1. Read `.jobhunterrc` to get the data path. Default to `./data` if not set.

2. Read `<dataPath>/jobs.json` raw content so you can inspect individual job details (notes, description, reason).

3. Run this node script to parse and group the jobs. Do not manually count or group — rely on the script output for all counts, groups, and warnings. Use `node -e` from the data path:

```js
const fs = require("fs");
const jobs = JSON.parse(fs.readFileSync("jobs.json", "utf8"));
const now = new Date();
const daysAgo = (d) => Math.floor((now - new Date(d)) / 86400000);

const groups = { saved: [], applying: [], applied: [], declined: [], interviewing: [], offered: [], rejected: [] };
for (const j of jobs) {
  const status = j.status || "saved";
  if (groups[status]) groups[status].push(j);
}

const output = { counts: {}, tables: {}, warnings: [], actions: [] };

for (const [status, items] of Object.entries(groups)) {
  output.counts[status] = items.length;
  if (items.length === 0) continue;

  const rows = items.map((j, i) => {
    const d = j.dates || {};
    const savedDays = d.saved ? daysAgo(d.saved) : null;
    const appliedDays = d.applied ? daysAgo(d.applied) : null;
    const closedDays = d.closed ? daysAgo(d.closed) : null;

    const trunc = (s, n) => s.length > n ? s.slice(0, n).replace(/\s+\S*$/, "") : s;

    const fitHeadline = j.notes
      ? trunc(j.notes
          .replace(/^(PERFECT MATCH|EXCELLENT MATCH|STRONG MATCH|GREAT MATCH|Decent match|EXCELLENT SALARY)\s*\([^)]*\)[.!]\s*/i, "")
          .replace(/^(PERFECT MATCH|EXCELLENT MATCH|STRONG MATCH|GREAT MATCH|Decent match|EXCELLENT SALARY)[.!]\s*/i, "")
          .split(/[.!]\s+/)[0], 55)
      : null;

    const companyBlurb = j.description
      ? trunc(j.description.split(/[.!]\s+/)[0], 65)
      : null;

    const headline = [companyBlurb, fitHeadline].filter(Boolean).join("; ");

    let row = {
      num: i + 1,
      id: j.id,
      company: j.company,
      title: j.title,
      url: j.url,
      salary: j.salary,
      headline,
      savedDays,
      appliedDays,
      closedDays,
      reason: j.reason,
      notes: j.notes ? j.notes.slice(0, 200) + (j.notes.length > 200 ? "..." : "") : null,
    };

    if (status === "saved" && savedDays !== null && savedDays > 7) {
      output.warnings.push(`Stale saved job: ${j.company} — ${j.title} (${savedDays} days)`);
    }
    if (status === "applied" && appliedDays !== null && appliedDays > 14 && !d.last_contact) {
      output.warnings.push(`No follow-up: ${j.company} — ${j.title} (${appliedDays} days)`);
    }
    return row;
  });

  output.tables[status] = rows;
}

// Next actions
const totalSaved = output.counts.saved || 0;
const totalApplied = output.counts.applied || 0;
const totalInterviewing = output.counts.interviewing || 0;
const totalApplying = output.counts.applying || 0;

if (totalSaved + totalApplying + totalApplied + totalInterviewing === 0) {
  output.actions.push("Run `/search` to discover new roles.");
}
if (totalSaved > 0) {
  output.actions.push(`Run \`/apply <id>\` for your ${totalSaved} saved jobs.`);
}
if (totalApplied > 5 && totalInterviewing === 0) {
  output.actions.push(">5 applications with no interviews — review your CV and cover letter approach.");
}

console.log(JSON.stringify(output, null, 2));
```

Run with: `node -e '<the script>'` from `<dataPath>/`. Use the JSON output to populate the dashboard display below. **Never count manually — use the script's `counts` object for all group sizes.**

4. If jobs.json is empty or missing: "No tracked jobs yet. Run `/search` to discover roles and `/track <url>` to save listings."

5. Display the dashboard using the script output:

```
## Saved ({counts.saved} jobs)
| # | Company | Title | Headline | Saved | Link |
|---|---------|-------|---------|-------|------|
| 1 | Acme    | Sr Eng | German health-tech startup | 3d ago | [Job](https://...) |

## Applying ({counts.applying} jobs)
...

## Applied ({counts.applied} jobs)
| # | Company | Title | Headline | Applied | Waiting | Link |
|---|---------|-------|---------|---------|---------|------|
| 3 | Beta    | Lead   | Fintech platform scaling infra | 5d ago  | 5 days  | [Job](https://...) |

## Interviewing ({counts.interviewing} jobs)
...
```

Include any extra status groups present (declined, offered, rejected) with appropriate columns.

6. **Warnings** — display any warnings from the script output at the top of the dashboard.

7. **Next actions** — display the actions from the script output.

8. At the end, ask if the user wants to update any job statuses.
