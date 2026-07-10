const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth")();

chromium.use(stealth);

function sleep(ms, jitter = 0.3) {
  const j = ms * jitter * (Math.random() * 2 - 1);
  return new Promise((r) => setTimeout(r, ms + j));
}

async function loadSite(name) {
  try {
    return require(`./sites/${name}`);
  } catch {
    const available = require("fs")
      .readdirSync(require("path").join(__dirname, "sites"))
      .map((f) => f.replace(".js", ""))
      .join(", ");
    throw new Error(
      `Unknown source "${name}". Available: ${available}`
    );
  }
}

async function scrape(source, query) {
  const site = await loadSite(source);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    viewport: { width: 1440, height: 900 },
    locale: "en-US",
  });

  try {
    const jobs = await site.search(context, query);
    return jobs.filter((j) => j.title);
  } finally {
    await context.close();
    await browser.close();
  }
}

(async () => {
  const args = process.argv.slice(2);
  const srcIdx = args.indexOf("--source");
  const qIdx = args.indexOf("--query");
  if (srcIdx === -1 || qIdx === -1) {
    console.error("Usage: node scripts/scrape.js --source <src> --query <q>");
    process.exit(1);
  }
  const source = args[srcIdx + 1];
  const query = args[qIdx + 1];

  try {
    const jobs = await scrape(source, query);
    console.log(JSON.stringify(jobs));
  } catch (e) {
    console.error(`Scrape failed for ${source}: ${e.message}`);
    console.log("[]");
  }
})();
