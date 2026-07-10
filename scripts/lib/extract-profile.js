const KNOWN_INDUSTRIES = new Set([
  "gambling", "military", "crypto", "dating", "online dating",
]);

const KNOWN_TECH_STACKS = new Set([
  "ruby on rails", "java",
]);

const KNOWN_BUSINESS_TYPES = new Set([
  "agencies", "agency",
]);

function extractPreferences(md) {
  const parts = (md || "").split("## Preferences");
  const section = parts.length > 1 ? parts[1] : (md || "");
  const lines = section.split("\n");

  const dealbreakers = { industries: [], techStacks: [], types: [] };
  let workModel = null;
  let salaryLow = null;
  let salaryHigh = null;
  let preferredTitles = [];
  let employmentTypes = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("- ")) continue;

    const content = trimmed.slice(2);

    if (content.toLowerCase().startsWith("dealbreakers:")) {
      const raw = content.split(":")[1] || "";
      const items = raw
        .split(",")
        .map((s) => s.trim().replace(/^no\s+/i, "").toLowerCase())
        .filter(Boolean);

      for (const item of items) {
        if (KNOWN_INDUSTRIES.has(item)) {
          dealbreakers.industries.push(item === "online dating" ? "dating" : item);
        } else if (KNOWN_TECH_STACKS.has(item)) {
          dealbreakers.techStacks.push(item);
        } else if (KNOWN_BUSINESS_TYPES.has(item)) {
          dealbreakers.types.push(item);
        } else if (item === "online dating") {
          dealbreakers.industries.push("dating");
        } else {
          dealbreakers.techStacks.push(item);
        }
      }
    }

    if (content.toLowerCase().startsWith("work model:")) {
      const val = content.split(":")[1]?.trim().toLowerCase() || "";
      if (val.includes("remote")) workModel = "remote";
      else if (val.includes("hybrid")) workModel = "hybrid";
      else if (val.includes("onsite") || val.includes("on-site")) workModel = "onsite";
    }

    if (content.toLowerCase().startsWith("salary range:")) {
      const val = content.split(":")[1] || "";
      const numbers = val.match(/[\d,]+k?/gi);
      if (numbers && numbers.length >= 1) {
        const parse = (s) => {
          let n = s.toLowerCase().replace(/[,£$€]/g, "");
          if (n.endsWith("k")) n = n.replace(/k/i, "000");
          return parseInt(n, 10);
        };
        salaryLow = parse(numbers[0]);
        if (numbers.length >= 2) salaryHigh = parse(numbers[1]);
        if (salaryHigh !== null && salaryHigh < salaryLow) {
          [salaryLow, salaryHigh] = [salaryHigh, salaryLow];
        }
      }
    }

    if (content.toLowerCase().startsWith("role titles:")) {
      preferredTitles = (content.split(":")[1] || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    }

    if (content.toLowerCase().startsWith("employment type:")) {
      employmentTypes = (content.split(":")[1] || "")
        .split(",")
        .map((s) => s.trim().toLowerCase().replace(/\(.*\)/, "").trim().replace(/^or\s+/i, ""))
        .filter(Boolean);
    }
  }

  return {
    dealbreakers,
    workModel,
    salaryLow,
    salaryHigh,
    preferredTitles,
    employmentTypes,
  };
}

module.exports = { extractPreferences };
