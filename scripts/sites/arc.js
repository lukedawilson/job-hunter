module.exports = {
  name: "Arc",

  url: () => "https://arc.dev/remote-jobs?jobRoles=engineering",

  async search(context, query, limit = 5) {
    const page = await context.newPage();
    await page.goto(this.url(), {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await page.waitForTimeout(3000);

    const jobs = await page.$$eval(
      "a[href*='/remote-jobs/details/']",
      (items, opts) => {
        const limit = opts.limit;
        const keywords = opts.kw.split(/\s+/).filter((k) => k.length > 1);
        return items
          .map((a) => {
            const text = a.textContent?.trim() ?? "";
            const href = a.getAttribute("href") ?? "";
            const title = text.split(" - ")[0]?.trim() || text.split("\n")[0]?.trim() || "";
            return {
              title,
              company: "",
              location: "Remote",
              url: href.startsWith("http")
                ? href
                : `https://arc.dev${href}`,
            };
          })
          .filter(
            (j) =>
              j.title &&
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
