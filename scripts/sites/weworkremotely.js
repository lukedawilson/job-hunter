module.exports = {
  name: "We Work Remotely",

  meta: {
    paginates: true,
    defaultPages: 20,
    locationHint: "check_listing",
    suggestedQuery: "engineer",
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

    const jobs = await page.$$eval(
      "section.jobs article ul li",
      (items, limit) =>
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
            url: href.startsWith("http")
              ? href
              : `https://weworkremotely.com${href}`,
          };
        })
        .filter(Boolean)
        .slice(0, limit)
    , limit);

    await page.close();
    return jobs;
  },
};
