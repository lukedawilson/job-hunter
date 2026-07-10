module.exports = {
  name: "Y Combinator Jobs",

  url: () => "https://www.ycombinator.com/jobs/role/software-engineer",

  async search(context, query, limit = 5) {
    const page = await context.newPage();
    await page.goto(this.url(), {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await page.waitForTimeout(3000);

    const keywords = query.toLowerCase().split(/\s+/);

    const jobs = await page.$$eval(
      'a[href*="/companies/"][href*="/jobs/"]',
      (items, opts) => {
        const keywords = opts.kw.split(",");
        const limit = opts.limit;
        return items
          .map((a) => {
            const href = a.getAttribute("href") ?? "";
            const text = a.textContent?.trim() ?? "";
            return {
              title: text,
              company:
                href
                  .split("/companies/")[1]
                  ?.split("/")[0]
                  ?.replace(/-/g, " ") ?? "",
              url: href.startsWith("http")
                ? href
                : `https://www.ycombinator.com${href}`,
              location: "",
            };
          })
          .filter(
            (j) =>
              j.title.length > 3 &&
              keywords.some(
                (k) =>
                  j.title.toLowerCase().includes(k) ||
                  j.company.toLowerCase().includes(k)
              )
          )
          .slice(0, limit);
      },
      { kw: keywords.join(","), limit }
    );

    await page.close();
    return jobs;
  },
};
