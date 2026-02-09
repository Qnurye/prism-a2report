import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateReport, loadSchema, checkMdxContent } from "./validate-report.js";

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

  it("accepts tabs with nested sections", () => {
    const report = {
      title: "Test",
      sections: [
        {
          type: "tabs",
          tabs: [
            {
              label: "Text",
              sections: [{ type: "text", content: "Simple text" }],
            },
            {
              label: "Data",
              sections: [
                { type: "statcard", label: "Users", value: 100 },
                { type: "code", code: "console.log(1)" },
              ],
            },
          ],
        },
      ],
    };
    const { valid, errors } = validateReport(report, schema);
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it("accepts tabs with different section types", () => {
    const report = {
      title: "Test",
      sections: [
        {
          type: "tabs",
          tabs: [
            {
              label: "Chart",
              sections: [
                {
                  type: "chart",
                  chartType: "bar",
                  data: { labels: ["A"], datasets: [{ data: [1] }] },
                },
              ],
            },
            {
              label: "Table",
              sections: [{ type: "table", headers: ["X"], rows: [["1"]] }],
            },
          ],
        },
      ],
    };
    const { valid } = validateReport(report, schema);
    expect(valid).toBe(true);
  });

  it("rejects tabs with nested tabs (no recursive nesting)", () => {
    const report = {
      title: "Test",
      sections: [
        {
          type: "tabs",
          tabs: [
            {
              label: "A",
              sections: [{ type: "text", content: "text" }],
            },
            {
              label: "B",
              sections: [
                {
                  type: "tabs",
                  tabs: [
                    { label: "Inner1", sections: [{ type: "text", content: "x" }] },
                    { label: "Inner2", sections: [{ type: "text", content: "y" }] },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    const { valid } = validateReport(report, schema);
    expect(valid).toBe(false);
  });

  it("rejects tab item without sections", () => {
    const report = {
      title: "Test",
      sections: [
        {
          type: "tabs",
          tabs: [{ label: "A" }, { label: "B", sections: [{ type: "text", content: "text" }] }],
        },
      ],
    };
    const { valid } = validateReport(report, schema);
    expect(valid).toBe(false);
  });
});

describe("checkMdxContent", () => {
  it("detects curly braces in text content", () => {
    const report = {
      title: "T",
      sections: [{ type: "text", content: "Use {value} here" }],
    };
    const warnings = checkMdxContent(report);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].match).toBe("{");
    expect(warnings[0].sectionIndex).toBe(0);
    expect(warnings[0].field).toBe("content");
  });

  it("detects < in non-tag context", () => {
    const report = {
      title: "T",
      sections: [{ type: "text", content: "Performance <2%" }],
    };
    const warnings = checkMdxContent(report);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].match).toBe("<");
  });

  it("does not warn for valid HTML tags", () => {
    const report = {
      title: "T",
      sections: [{ type: "text", content: "Has <em>emphasis</em> and <br> tags" }],
    };
    const warnings = checkMdxContent(report);
    expect(warnings).toHaveLength(0);
  });

  it("returns empty array for clean report", () => {
    const report = {
      title: "T",
      sections: [
        { type: "text", content: "Normal content" },
        { type: "chart", chartType: "bar", data: { labels: [] } },
      ],
    };
    const warnings = checkMdxContent(report);
    expect(warnings).toHaveLength(0);
  });

  it("reports correct section index and field for heading", () => {
    const report = {
      title: "T",
      sections: [
        { type: "text", content: "clean" },
        { type: "text", heading: "Values {x}", content: "also clean" },
      ],
    };
    const warnings = checkMdxContent(report);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].sectionIndex).toBe(1);
    expect(warnings[0].field).toBe("heading");
  });

  it("detects special chars in callout content", () => {
    const report = {
      title: "T",
      sections: [{ type: "callout", variant: "info", content: "Limit <5%" }],
    };
    const warnings = checkMdxContent(report);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].sectionIndex).toBe(0);
    expect(warnings[0].field).toBe("content");
  });

  it("detects special chars from fixture", () => {
    const report = fixture("mdx-special-chars-report.json");
    const warnings = checkMdxContent(report);
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some((w) => w.sectionIndex === 0 && w.field === "heading")).toBe(true);
    expect(warnings.some((w) => w.sectionIndex === 0 && w.field === "content")).toBe(true);
    expect(warnings.some((w) => w.sectionIndex === 2 && w.field === "content")).toBe(true);
    // Section 1 has valid HTML tags only — no warning
    expect(warnings.some((w) => w.sectionIndex === 1)).toBe(false);
    // Section 3 is clean — no warning
    expect(warnings.some((w) => w.sectionIndex === 3)).toBe(false);
  });
});
