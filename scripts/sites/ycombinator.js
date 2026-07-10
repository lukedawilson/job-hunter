module.exports = {
  name: "Y Combinator Jobs",

  meta: {
    paginates: true,
    defaultPages: 20,
    locationHint: "check_listing",
    suggestedQuery: "software engineer",
  },

  url: () => "https://www.ycombinator.com/jobs/role/software-engineer",

  async search(context, query, limit = 5, page = 0) {
    const pageCtx = await context.newPage();
    await pageCtx.goto(this.url(), {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await pageCtx.waitForTimeout(2000);

    for (let i = 0; i < page; i++) {
      await pageCtx.evaluate(() => window.scrollBy(0, document.body.scrollHeight));
      await new Promise((r) => setTimeout(r, 1000));
    }

    const keywords = query.toLowerCase().split(/\s+/);

    const jobs = await pageCtx.$$eval(
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

    await pageCtx.close();
    return jobs;
  },
};
