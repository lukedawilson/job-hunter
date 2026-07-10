module.exports = {
  name: "Indeed",

  meta: {
    paginates: true,
    defaultPages: 20,
    locationHint: "us_biased",
    suggestedQuery: "senior staff principal software engineer",
  },

  url: (query, page = 0) =>
    `https://www.indeed.com/jobs?q=${encodeURIComponent(query)}&sc=0kf%3Aattr(DSQF7)%3B&sort=date&start=${page * 10}`,

  async search(context, query, limit = 5, pageNum = 0) {
    const page = await context.newPage();
    await page.goto(this.url(query, pageNum), {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await page.waitForTimeout(3000);

    const jobs = await page.$$eval(
      "div.job_seen_beacon, td.resultContent, div[class*='job_seen']",
      (items, opts) => {
        const limit = opts.limit;
        const keywords = opts.kw.split(/\s+/).filter((k) => k.length > 1);
        return items
          .map((el) => {
            const titleEl = el.querySelector("h2.jobTitle span, h2 a span, a[data-jk] span");
            const title = titleEl?.textContent?.trim() ?? "";
            const companyEl = el.querySelector("[data-testid='company-name'], .companyName, .company_location span");
            const company = companyEl?.textContent?.trim() ?? "";
            const locationEl = el.querySelector("[data-testid='text-location'], .companyLocation");
            const location = locationEl?.textContent?.trim() ?? "Remote";
            const link = el.querySelector("a[href*='/rc/clk'], a[data-jk]");
            const href = link?.getAttribute("href") ?? "";
            const url = href.startsWith("/") ? `https://www.indeed.com${href}` : href;
            const salaryEl = el.querySelector(".salary-snippet-container, .attribute_snippet");
            const salary = salaryEl?.textContent?.trim() ?? "";
            return { title, company, location, url, salary };
          })
          .filter(
            (j) =>
              j.title && j.url &&
              keywords.some((k) => j.title.toLowerCase().includes(k))
          )
          .slice(0, limit);
      },
      { limit, kw: query }
    );

    await page.close();
    return jobs;
  },
};
