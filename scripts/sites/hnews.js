module.exports = {
  name: "Hacker News: Who is hiring?",

  url: () => "https://news.ycombinator.com",

  async search(context, query, limit = 5) {
    const page = await context.newPage();

    const resp = await page.evaluate(async () => {
      const r = await fetch(
        "https://hn.algolia.com/api/v1/search?query=Ask+HN+Who+is+hiring&tags=story&restrictSearchableAttributes=title&hitsPerPage=1"
      );
      return r.json();
    });
    const threadId = resp.hits?.[0]?.objectID;
    if (!threadId) {
      await page.close();
      return [];
    }

    await page.goto(`https://news.ycombinator.com/item?id=${threadId}`, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await page.waitForTimeout(2000);

    const comments = await page.$$eval("div.comment", (nodes) =>
      nodes.map((n) => n.textContent ?? "")
    );

    await page.close();

    const keywords = query.toLowerCase().split(/\s+/);
    return comments
      .filter((text) =>
        keywords.some(
          (kw) => kw.length > 2 && text.toLowerCase().includes(kw)
        )
      )
      .slice(0, limit)
      .map((text) => {
        const firstLine = text.split("\n")[0].trim();
        return {
          title: firstLine.slice(0, 120),
          company: "",
          location: "See listing",
          url: "",
          snippet: text.slice(0, 300),
        };
      });
  },
};
