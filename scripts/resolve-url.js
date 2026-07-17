async function resolveExternalUrl(page, boardDomain) {
  return await page.evaluate((boardDomain) => {
    const links = Array.from(document.querySelectorAll("a"));

    const atsDomains = [
      "greenhouse.io", "lever.co", "jobs.lever.co",
      "apply.workable.com", "jobs.ashbyhq.com",
      "ashbyhq.com", "breezy.hr", "recruitee.com",
      "workable.com", "smartrecruiters.com",
      "jobvite.com", "icims.com", "taleo.net",
      "myworkdayjobs.com", "workday.com",
    ];

    for (const a of links) {
      const href = a.href || "";
      if (atsDomains.some((d) => href.toLowerCase().includes(d))) {
        return href;
      }
    }

    for (const a of links) {
      const text = (a.textContent || "").trim().toLowerCase();
      const href = a.href || "";
      if (
        /apply/i.test(text) &&
        href &&
        !href.toLowerCase().includes(boardDomain.toLowerCase())
      ) {
        return href;
      }
    }

    return null;
  }, boardDomain);
}

module.exports = { resolveExternalUrl };
