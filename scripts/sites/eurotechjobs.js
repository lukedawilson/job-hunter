module.exports = {
  name: "EuroTechJobs",

  url: () => "https://www.eurotechjobs.com/job_search",

  async search(context, query, limit = 5) {
    const page = await context.newPage();
    await page.goto(this.url(), {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await page.waitForTimeout(3000);

    const jobs = await page.$$eval(
      "li.premiumJobContainer",
      (items, opts) => {
        const limit = opts.limit;
        const keywords = opts.kw.split(/\s+/).filter((k) => k.length > 1);
        return items
          .map((li) => {
            const h3a = li.querySelector("h3 a[href*='/job_display/']");
            if (!h3a) return null;
            const title = h3a.textContent?.trim() ?? "";
            const text = li.textContent.replace(/\s+/g, " ").trim();
            const idx = text.indexOf(title);
            if (idx < 0) return null;
            const after = text.slice(idx + title.length).trim();
            const parts = after.split(" ");
            const commaIdx = parts.findIndex((p) => p.includes(","));
            const company =
              commaIdx > 0 ? parts.slice(0, commaIdx).join(" ") : parts[0] ?? "";
            const location =
              commaIdx > 0 ? parts.slice(commaIdx).join(" ").split(".")[0].trim() : "";
            return {
              title,
              company,
              location: location || "Europe",
              url: h3a.href.startsWith("http")
                ? h3a.href
                : `https://www.eurotechjobs.com${h3a.getAttribute("href")}`,
            };
          })
          .filter(Boolean)
          .filter(
            (j) =>
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
