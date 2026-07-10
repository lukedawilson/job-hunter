module.exports = {
  name: "Remote OK",

  meta: {
    paginates: false,
    defaultPages: 0,
    locationHint: "worldwide",
    suggestedQuery: "senior staff principal engineer",
    preferFreelance: true,
  },

  url: () => "https://remoteok.com/remote-dev-jobs",

  async search(context, query, limit = 5) {
    const page = await context.newPage();
    await page.goto(this.url(), {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await page.waitForTimeout(2000);

    const jobs = await page.evaluate(async () => {
      const r = await fetch("/api?tag=dev");
      return r.json();
    });

    await page.close();

    const keywords = query.toLowerCase().split(/\s+/);
    return jobs
      .filter((j) => j.position && j.company)
      .filter((j) =>
        keywords.some((kw) => j.position.toLowerCase().includes(kw))
      )
      .slice(0, limit)
      .map((j) => ({
        title: j.position,
        company: j.company,
        url: `https://remoteok.com/remote-jobs/${j.slug}`,
        location: "Remote",
        tags: j.tags || [],
      }));
  },
};
