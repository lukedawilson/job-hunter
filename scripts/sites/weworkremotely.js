const { resolveExternalUrl } = require("../resolve-url");

module.exports = {
  name: "We Work Remotely",

  meta: {
    paginates: true,
    defaultPages: 20,
    locationHint: "check_listing",
    suggestedQuery: "engineer",
    paywalled: true,
  },

  url: (query, page = 1) =>
    `https://weworkremotely.com/remote-jobs/search?term=${encodeURIComponent(query)}&page=${page}`,

  async search(context, query, limit = 5, pageNum = 0) {
    const page = await context.newPage();
    await page.goto(this.url(query, pageNum + 1), {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await page.waitForTimeout(3000);

    const listings = await page.$$eval(
      "section.jobs article ul li",
      (items) =>
        items
          .map((li) => {
            const link = li.querySelector("a.listing-link--unlocked");
            if (!link) return null;
            const href = link.getAttribute("href") ?? "";
            const title =
              li.querySelector(
                ".new-listing__header__title__text"
              )?.textContent?.trim() ?? "";
            const company =
              li
                .querySelector(".new-listing__company-name")
                ?.textContent?.trim() ?? "";
            const location =
              li
                .querySelector(".new-listing__company-headquarters")
                ?.textContent?.trim() ?? "";
            return {
              title,
              company,
              location,
              listing_url: href.startsWith("http")
                ? href
                : `https://weworkremotely.com${href}`,
            };
          })
          .filter(Boolean)
    );

    const candidates = listings.slice(0, limit);
    const results = [];

    for (const listing of candidates) {
      try {
        await page.goto(listing.listing_url, {
          waitUntil: "domcontentloaded",
          timeout: 10000,
        });
        await page.waitForTimeout(2000);

        const resolvedUrl = await resolveExternalUrl(page, "weworkremotely.com");

        results.push({
          title: listing.title,
          company: listing.company,
          location: listing.location,
          url: resolvedUrl,
          listing_url: listing.listing_url,
          source: "weworkremotely",
          unverifiable: !resolvedUrl,
        });
      } catch {
        results.push({
          title: listing.title,
          company: listing.company,
          location: listing.location,
          url: null,
          listing_url: listing.listing_url,
          source: "weworkremotely",
          unverifiable: true,
        });
      }
    }

    await page.close();
    return results;
  },
};
