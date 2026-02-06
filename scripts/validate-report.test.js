import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateReport, loadSchema } from "./validate-report.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = (name) =>
  JSON.parse(readFileSync(resolve(__dirname, "__fixtures__", name), "utf-8"));

describe("loadSchema", () => {
  it("returns a valid JSON schema object", () => {
    const schema = loadSchema();
    expect(schema).toHaveProperty("$schema");
    expect(schema).toHaveProperty("definitions");
    expect(schema.required).toContain("title");
    expect(schema.required).toContain("sections");
  });
});

describe("validateReport", () => {
  const schema = loadSchema();

  it("accepts a valid report with all section types", () => {
    const report = fixture("valid-report.json");
    const { valid, errors } = validateReport(report, schema);
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it("accepts a minimal report", () => {
    const report = fixture("minimal-report.json");
    const { valid, errors } = validateReport(report, schema);
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it("rejects a report missing title", () => {
    const report = fixture("invalid-report-missing-title.json");
    const { valid, errors } = validateReport(report, schema);
    expect(valid).toBe(false);
    expect(errors.some((e) => e.message.includes("title"))).toBe(true);
  });

  it("rejects a report with unknown section type", () => {
    const report = fixture("invalid-report-bad-section-type.json");
    const { valid } = validateReport(report, schema);
    expect(valid).toBe(false);
  });

  it("rejects a report with invalid date format", () => {
    const report = { title: "Test", date: "not-a-date", sections: [] };
    const { valid } = validateReport(report, schema);
    expect(valid).toBe(false);
  });

  it("rejects a report with invalid slug pattern", () => {
    const report = { title: "Test", slug: "INVALID SLUG!", sections: [] };
    const { valid } = validateReport(report, schema);
    expect(valid).toBe(false);
  });

  it("rejects a report without sections", () => {
    const report = { title: "Test" };
    const { valid } = validateReport(report, schema);
    expect(valid).toBe(false);
  });

  it("returns all errors when multiple fields are invalid", () => {
    const report = { date: "bad", slug: "BAD!" };
    const { valid, errors } = validateReport(report, schema);
    expect(valid).toBe(false);
    expect(errors.length).toBeGreaterThan(1);
  });
});
