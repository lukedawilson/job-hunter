const { describe, it } = require("node:test");
const assert = require("node:assert");
const { filterJobs } = require("./filter-jobs");

const defaultPrefs = {
  dealbreakers: {
    industries: ["gambling", "military", "crypto", "dating"],
    techStacks: ["ruby on rails", "java"],
    types: ["agencies"],
  },
  workModel: "remote",
  salaryLow: 80000,
  salaryHigh: 100000,
};

let jobCounter = 0;
function makeJob(overrides = {}, source = "indeed") {
  jobCounter++;
  return {
    title: "Senior Engineer",
    company: "Acme Corp",
    location: "Remote",
    url: `https://example.com/job/${jobCounter}`,
    _source: source,
    _sourceMeta: { locationHint: "worldwide" },
    ...overrides,
  };
}

describe("filterJobs", () => {
  it("deduplicates by URL", () => {
    const input = [
      makeJob({ url: "https://a.com/1", title: "Job A" }),
      makeJob({ url: "https://a.com/1", title: "Job A" }),
      makeJob({ url: "https://a.com/2", title: "Job B" }),
    ];

    const result = filterJobs(input, defaultPrefs);
    assert.strictEqual(result.results.length, 2);
    assert.strictEqual(result.stats.deduplicated, 1);
    assert.strictEqual(result.results[0].url, "https://a.com/1");
    assert.strictEqual(result.results[1].url, "https://a.com/2");
  });

  it("filters out onsite jobs", () => {
    const input = [
      makeJob({ location: "Onsite, New York" }),
      makeJob({ location: "on-site London" }),
      makeJob({ location: "Remote" }),
    ];

    const result = filterJobs(input, defaultPrefs);
    assert.strictEqual(result.results.length, 1);
    assert.strictEqual(result.results[0].location, "Remote");
    assert.strictEqual(result.stats.filteredOnsite, 2);
  });

  it("filters out hybrid jobs (keeps hybrid+remote combos)", () => {
    const input = [
      makeJob({ location: "Hybrid - London" }),
      makeJob({ location: "hybrid remote" }),
      makeJob({ location: "Remote" }),
    ];

    const result = filterJobs(input, defaultPrefs);
    assert.strictEqual(result.results.length, 2);
    assert.strictEqual(result.stats.filteredHybrid, 1);
  });

  it("preserves remote jobs with 'remote' somewhere in location", () => {
    const input = [
      makeJob({ location: "Remote, USA" }),
      makeJob({ location: "London, UK (Remote)" }),
      makeJob({ location: "100% Remote" }),
    ];

    const result = filterJobs(input, defaultPrefs);
    assert.strictEqual(result.results.length, 3);
  });

  it("filters us_biased locations with explicit US mention even if 'Remote'", () => {
    const input = [
      makeJob({ location: "Remote", _sourceMeta: { locationHint: "worldwide" } }, "remoteok"),
      makeJob({ location: "Remote, USA", _sourceMeta: { locationHint: "us_biased" } }, "indeed"),
    ];

    const result = filterJobs(input, defaultPrefs);
    assert.strictEqual(result.results.length, 1);
    assert.strictEqual(result.results[0]._source, "remoteok");
    assert.strictEqual(result.stats.filteredUsGeolocked, 1);
  });

  it("flags but keeps us_biased jobs with plain 'Remote' location for review", () => {
    const input = [
      makeJob({ location: "Remote", _sourceMeta: { locationHint: "us_biased" } }, "indeed"),
    ];

    const result = filterJobs(input, defaultPrefs);
    assert.strictEqual(result.results.length, 1); // kept
    assert.strictEqual(result.flags.length, 1);
    assert.match(result.flags[0].reason, /us_biased/);
    assert.ok(result.flags[0].job.url.startsWith("https://example.com/job/"));
  });

  it("accepts check_listing locations as valid remote", () => {
    const input = [
      makeJob({ location: "Remote", _sourceMeta: { locationHint: "check_listing" } }, "wwr"),
    ];

    const result = filterJobs(input, defaultPrefs);
    assert.strictEqual(result.results.length, 1);
    assert.strictEqual(result.flags.length, 0);
  });

  it("handles empty input", () => {
    const result = filterJobs([], defaultPrefs);
    assert.strictEqual(result.results.length, 0);
    assert.strictEqual(result.stats.total, 0);
    assert.strictEqual(result.flags.length, 0);
  });

  it("handles input without _sourceMeta gracefully", () => {
    const input = [
      { title: "Job", company: "Co", location: "Remote", url: "https://a.com/1" },
    ];

    const result = filterJobs(input, defaultPrefs);
    assert.strictEqual(result.results.length, 1);
  });

  it("generates correct stats", () => {
    const input = [
      makeJob({ url: "https://a.com/1" }),
      makeJob({ url: "https://a.com/1" }), // dup
      makeJob({ url: "https://a.com/2", location: "Onsite" }),
      makeJob({ url: "https://a.com/3", location: "Hybrid" }),
      makeJob({ url: "https://a.com/4" }),
    ];

    const result = filterJobs(input, defaultPrefs);
    assert.strictEqual(result.stats.total, 5);
    assert.strictEqual(result.stats.deduplicated, 1);
    assert.strictEqual(result.stats.filteredOnsite, 1);
    assert.strictEqual(result.stats.filteredHybrid, 1);
    assert.strictEqual(result.results.length, 2);
  });

  it("removes duplicates keeping the first occurrence", () => {
    const input = [
      makeJob({ url: "https://a.com/1", company: "First" }, "indeed"),
      makeJob({ url: "https://a.com/1", company: "Second" }, "wwr"),
    ];

    const result = filterJobs(input, defaultPrefs);
    assert.strictEqual(result.results.length, 1);
    assert.strictEqual(result.results[0].company, "First");
    assert.strictEqual(result.results[0]._source, "indeed");
  });
});
