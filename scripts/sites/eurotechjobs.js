module.exports = {
  name: "EuroTechJobs",

  url: () => "https://www.eurotechjobs.com/jobs/5+_years_experience",

  async search(context, query, limit = 5) {
    const page = await context.newPage();
    await page.goto(this.url(), {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await page.waitForTimeout(3000);

    const jobs = await page.$$eval(
      "a[href*='/job_display/']",
      (items, opts) => {
        const limit = opts.limit;
        const keywords = opts.kw.split(/\s+/).filter((k) => k.length > 1);
        return items
          .filter((a) => {
            const text = a.textContent?.trim() ?? "";
            return text.length > 5;
          })
          .map((a) => {
            const title = a.textContent?.trim() ?? "";
            const url = a.getAttribute("href") ?? "";
            const slug = url.split("/").pop() ?? "";
            const slugParts = slug.split("_");
            const companyIdx = slugParts.findIndex(
              (p, i) => i > 2 && /^[A-Z]/.test(p) && p.length > 3
            );
            const company =
              companyIdx > 0
                ? slugParts[companyIdx].replace(/-/g, " ")
                : "";
            return { title, company, location: "Europe", url: `https://www.eurotechjobs.com${url}` };
          })
          .filter(
            (j) =>
              j.title &&
              keywords.some(
                (k) =>
                  j.title.toLowerCase().includes(k) ||
                  j.company.toLowerCase().includes(k)
              )
          )
          .slice(0, limit);
      },
      { limit, kw: query }
    );

    await page.close();
    return jobs;
  },
};
