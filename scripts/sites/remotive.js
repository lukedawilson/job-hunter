module.exports = {
  name: "Remotive",

  url: () => "https://remotive.com/remote-jobs/software-development",

  async search(context, query, limit = 5) {
    const page = await context.newPage();
    await page.goto(this.url(), {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await page.waitForTimeout(3000);

    const jobs = await page.$$eval(
      "a[href*='/remote-jobs/'][href*='-']",
      (items, opts) => {
        const limit = opts.limit;
        const keywords = opts.kw.split(/\s+/).filter((k) => k.length > 1);
        return items
          .filter((a) => {
            const parts = a.getAttribute("href").split("/");
            const last = parts[parts.length - 1];
            return /\d{6,}/.test(last);
          })
          .map((a) => {
            const text = a.textContent?.trim() ?? "";
            const parts = text.split("•");
            const title = parts[0]?.trim() ?? "";
            const company = parts[1]?.split("\n")[0]?.trim() ?? "";
            return {
              title,
              company,
              location: "Remote",
              url: a.href,
            };
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
