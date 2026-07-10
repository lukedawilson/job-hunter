function findJob(jobs, id) {
  if (!id || !Array.isArray(jobs)) return null;
  return jobs.find((j) => j.id === id) || null;
}

if (require.main === module) {
  const fs = require("fs");

  const args = process.argv.slice(2);
  const getArg = (flag) => {
    const i = args.indexOf(flag);
    return i === -1 ? null : args[i + 1];
  };

  const jobsPath = getArg("--jobs");
  const id = getArg("--id");
  const listIds = args.includes("--ids");

  if (!jobsPath) {
    console.error("Usage: node scripts/find-job.js --jobs <jobs.json> [--id <job-id> | --ids]");
    process.exit(1);
  }

  try {
    const jobs = JSON.parse(fs.readFileSync(jobsPath, "utf8"));

    if (listIds) {
      for (const j of jobs) {
        console.log(`${j.id}  (${j.company} — ${j.title})`);
      }
      process.exit(0);
    }

    if (!id) {
      console.error("Usage: node scripts/find-job.js --jobs <jobs.json> --id <job-id>");
      process.exit(1);
    }

    const result = findJob(jobs, id);
    console.log(JSON.stringify(result));
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}

module.exports = { findJob };
