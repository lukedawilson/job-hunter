const ONSITE_RE = /\b(on-?site|onsite)\b/i;
const HYBRID_RE = /\bhybrid\b/i;
const US_GEOLOCKED_RE = /\b(?:USA|US|United States)\b|,\s*[A-Z]{2}\b/i;
const REMOTE_RE = /\bremote\b/i;

function filterJobs(jobs, preferences) {
  const seen = new Set();
  const results = [];
  const flags = [];
  const stats = {
    total: jobs.length,
    deduplicated: 0,
    filteredOnsite: 0,
    filteredHybrid: 0,
    filteredUsGeolocked: 0,
    flaggedUsBiased: 0,
  };

  for (const job of jobs) {
    if (seen.has(job.url)) {
      stats.deduplicated++;
      continue;
    }
    seen.add(job.url);

    const location = job.location || "";
    const meta = job._sourceMeta || {};
    const locationHint = meta.locationHint || "check_listing";

    if (ONSITE_RE.test(location) && !REMOTE_RE.test(location)) {
      stats.filteredOnsite++;
      continue;
    }

    if (HYBRID_RE.test(location) && !REMOTE_RE.test(location)) {
      stats.filteredHybrid++;
      continue;
    }

    if (locationHint === "us_biased") {
      if (US_GEOLOCKED_RE.test(location)) {
        stats.filteredUsGeolocked++;
        continue;
      }
      if (REMOTE_RE.test(location)) {
        flags.push({
          job: { title: job.title, company: job.company, url: job.url, source: job._source },
          reason: "us_biased source with plain 'Remote' — verify worldwide eligibility",
        });
        stats.flaggedUsBiased++;
      }
    }

    results.push(job);
  }

  return { results, flags, stats };
}

if (require.main === module) {
  const fs = require("fs");
  const path = require("path");
  const { extractPreferences } = require("./lib/extract-profile");

  const args = process.argv.slice(2);
  const profileIdx = args.indexOf("--profile");
  let profilePath = null;
  if (profileIdx !== -1 && profileIdx + 1 < args.length) {
    profilePath = args[profileIdx + 1];
    args.splice(profileIdx, 2);
  }

  const files = args.filter((a) => !a.startsWith("--"));
  if (files.length === 0) {
    console.error("Usage: node scripts/filter-jobs.js --profile <profile.md> <results1.json> [results2.json ...]");
    process.exit(1);
  }

  let prefs = {
    dealbreakers: { industries: [], techStacks: [], types: [] },
    workModel: null,
    salaryLow: null,
    salaryHigh: null,
  };

  if (profilePath) {
    try {
      const md = fs.readFileSync(profilePath, "utf8");
      prefs = extractPreferences(md);
    } catch (e) {
      console.error(`Warning: could not read profile at ${profilePath}: ${e.message}`);
    }
  }

  let allJobs = [];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(file, "utf8");
      const parsed = JSON.parse(raw);
      const jobs = Array.isArray(parsed) ? parsed : [parsed];
      const source = path.basename(file).replace(/^jh_search_/, "").replace(/\.json$/, "");
      for (const job of jobs) {
        if (!job._source) job._source = source;
      }
      allJobs = allJobs.concat(jobs);
    } catch (e) {
      console.error(`Warning: could not read ${file}: ${e.message}`);
    }
  }

  const result = filterJobs(allJobs, prefs);
  console.log(JSON.stringify(result, null, 2));
}

module.exports = { filterJobs };
