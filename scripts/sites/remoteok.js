const { resolveExternalUrl } = require("../resolve-url");

module.exports = {
  name: "Remote OK",

  meta: {
    paginates: false,
    defaultPages: 0,
    locationHint: "worldwide",
    suggestedQuery: "senior staff principal engineer",
    preferFreelance: true,
    paywalled: true,
  },

  url: () => "https://remoteok.com/remote-dev-jobs",

  async search(context, query, limit = 5) {
    const page = await context.newPage();
    await page.goto(this.url(), {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await page.waitForTimeout(2000);

    const apiJobs = await page.evaluate(async () => {
      const r = await fetch("/api?tag=dev");
      return r.json();
    });

    const keywords = query.toLowerCase().split(/\s+/);
    const matched = apiJobs
      .filter((j) => j.position && j.company)
      .filter((j) =>
        keywords.some((kw) => j.position.toLowerCase().includes(kw))
      )
      .slice(0, limit);

    const boardUrlFor = (slug) => `https://remoteok.com/remote-jobs/${slug}`;

    const hasApplyUrls = matched.some(
      (j) =>
        j.apply_url &&
        j.apply_url !== boardUrlFor(j.slug) &&
        !j.apply_url.toLowerCase().includes("remoteok.com")
    );

    if (hasApplyUrls) {
      await page.close();
      return matched.map((j) => {
        const boardUrl = boardUrlFor(j.slug);
        const directUrl =
          j.apply_url && j.apply_url !== boardUrl && !j.apply_url.toLowerCase().includes("remoteok.com")
            ? j.apply_url
            : null;
        return {
          title: j.position,
          company: j.company,
          url: directUrl,
          listing_url: boardUrl,
          location: "Remote",
          tags: j.tags || [],
          source: "remoteok",
          unverifiable: !directUrl,
        };
      });
    }

    const results = [];
    for (const job of matched) {
      const boardUrl = boardUrlFor(job.slug);
      try {
        await page.goto(boardUrl, {
          waitUntil: "domcontentloaded",
          timeout: 10000,
        });
        await page.waitForTimeout(2000);

        const resolvedUrl = await resolveExternalUrl(page, "remoteok.com");

        results.push({
          title: job.position,
          company: job.company,
          url: resolvedUrl,
          listing_url: boardUrl,
          location: "Remote",
          tags: job.tags || [],
          source: "remoteok",
          unverifiable: !resolvedUrl,
        });
      } catch {
        results.push({
          title: job.position,
          company: job.company,
          url: null,
          listing_url: boardUrl,
          location: "Remote",
          tags: job.tags || [],
          source: "remoteok",
          unverifiable: true,
        });
      }
    }

    await page.close();
    return results;
  },
};
