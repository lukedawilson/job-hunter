const { describe, it, before } = require("node:test");
const assert = require("node:assert");
const { extractPreferences } = require("./extract-profile");

describe("extractPreferences", () => {
  it("extracts dealbreakers from preferences section", () => {
    const md = `
## Preferences

- Role titles: Principal Engineer, Staff Engineer
- Dealbreakers: no gambling, military, crypto, agencies, Ruby on Rails, Java
- Work model: remote only
`;

    const prefs = extractPreferences(md);
    assert.deepStrictEqual(prefs.dealbreakers.industries, ["gambling", "military", "crypto"]);
    assert.deepStrictEqual(prefs.dealbreakers.techStacks, ["ruby on rails", "java"]);
    assert.deepStrictEqual(prefs.dealbreakers.types, ["agencies"]);
  });

  it("extracts work model", () => {
    const pref = extractPreferences("- Work model: remote only");
    assert.strictEqual(pref.workModel, "remote");

    const hybrid = extractPreferences("- Work model: hybrid");
    assert.strictEqual(hybrid.workModel, "hybrid");

    const onsite = extractPreferences("- Work model: onsite");
    assert.strictEqual(onsite.workModel, "onsite");
  });

  it("extracts salary range", () => {
    const pref = extractPreferences("- Salary range: 80k–100k EUR/USD (80k floor)");
    assert.strictEqual(pref.salaryLow, 80000);
    assert.strictEqual(pref.salaryHigh, 100000);
  });

  it("handles salary with different formats", () => {
    assert.strictEqual(extractPreferences("- Salary range: $120,000 - $170,000").salaryLow, 120000);
    assert.strictEqual(extractPreferences("- Salary range: 50k-70k").salaryLow, 50000);
    assert.strictEqual(extractPreferences("- Salary range: £135K-170K").salaryLow, 135000);
  });

  it("returns null salary when not found", () => {
    const pref = extractPreferences("- Work model: remote only");
    assert.strictEqual(pref.salaryLow, null);
    assert.strictEqual(pref.salaryHigh, null);
  });

  it("extracts preferred role titles", () => {
    const pref = extractPreferences("- Role titles: Principal Engineer, Staff Engineer, Agentic Engineer, Founding Engineer");
    assert.deepStrictEqual(pref.preferredTitles, [
      "principal engineer",
      "staff engineer",
      "agentic engineer",
      "founding engineer",
    ]);
  });

  it("extracts employment types", () => {
    const pref = extractPreferences("- Employment type: contractor, B2B, or employee (via Deel for international roles)");
    assert.deepStrictEqual(pref.employmentTypes, ["contractor", "b2b", "employee"]);
  });

  it("handles empty input", () => {
    const prefs = extractPreferences("");
    assert.deepStrictEqual(prefs.dealbreakers.industries, []);
    assert.deepStrictEqual(prefs.dealbreakers.techStacks, []);
    assert.deepStrictEqual(prefs.dealbreakers.types, []);
    assert.strictEqual(prefs.workModel, null);
    assert.strictEqual(prefs.salaryLow, null);
  });

  it("handles missing dealbreakers line", () => {
    const pref = extractPreferences("- Role titles: Staff Engineer\n- Work model: remote only");
    assert.deepStrictEqual(pref.dealbreakers.industries, []);
    assert.deepStrictEqual(pref.dealbreakers.techStacks, []);
    assert.strictEqual(pref.preferredTitles[0], "staff engineer");
  });

  it("handles dealbreakers with 'online dating' as industry", () => {
    const pref = extractPreferences("- Dealbreakers: no gambling, military, online dating, crypto");
    assert.deepStrictEqual(pref.dealbreakers.industries, ["gambling", "military", "dating", "crypto"]);
  });

  it("handles dealbreakers without 'no' prefix", () => {
    const pref = extractPreferences("- Dealbreakers: gambling, military, Java");
    assert.deepStrictEqual(pref.dealbreakers.industries, ["gambling", "military"]);
    assert.deepStrictEqual(pref.dealbreakers.techStacks, ["java"]);
  });
});
