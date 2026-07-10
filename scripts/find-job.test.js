const { describe, it } = require("node:test");
const assert = require("node:assert");
const { findJob } = require("./find-job");

const sampleJobs = [
  {
    id: "acme-senior-engineer",
    url: "https://example.com/job/1",
    title: "Senior Engineer",
    company: "Acme Corp",
    status: "saved",
  },
  {
    id: "beta-lead-developer",
    url: "https://example.com/job/2",
    title: "Lead Developer",
    company: "Beta Inc",
    status: "applied",
  },
  {
    id: "gamma-staff-architect",
    url: "https://example.com/job/3",
    title: "Staff Architect",
    company: "Gamma Ltd",
    status: "saved",
  },
];

describe("findJob", () => {
  it("finds a job by exact ID match", () => {
    const job = findJob(sampleJobs, "acme-senior-engineer");
    assert.strictEqual(job.id, "acme-senior-engineer");
    assert.strictEqual(job.title, "Senior Engineer");
    assert.strictEqual(job.company, "Acme Corp");
  });

  it("returns null when job ID not found", () => {
    const job = findJob(sampleJobs, "nonexistent-id");
    assert.strictEqual(job, null);
  });

  it("handles empty jobs array", () => {
    const job = findJob([], "any-id");
    assert.strictEqual(job, null);
  });

  it("handles null/undefined id gracefully", () => {
    assert.strictEqual(findJob(sampleJobs, null), null);
    assert.strictEqual(findJob(sampleJobs, undefined), null);
    assert.strictEqual(findJob(sampleJobs, ""), null);
  });

  it("returns the full job object", () => {
    const job = findJob(sampleJobs, "beta-lead-developer");
    assert.deepStrictEqual(job, {
      id: "beta-lead-developer",
      url: "https://example.com/job/2",
      title: "Lead Developer",
      company: "Beta Inc",
      status: "applied",
    });
  });

  it("finds the last job in the array", () => {
    const job = findJob(sampleJobs, "gamma-staff-architect");
    assert.strictEqual(job.company, "Gamma Ltd");
  });
});
