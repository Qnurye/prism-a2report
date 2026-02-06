import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { convertToMarkdown } from "./json-to-markdown.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = (name) =>
  JSON.parse(readFileSync(resolve(__dirname, "__fixtures__", name), "utf-8"));

describe("convertToMarkdown", () => {
  it("generates correct YAML frontmatter", () => {
    const report = fixture("valid-report.json");
    const output = convertToMarkdown(report);
    expect(output).toContain('title: "Test Report"');
    expect(output).toContain('author: "Test Author"');
    expect(output).toContain('date: "2025-01-15"');
  });

  it("includes tags in frontmatter", () => {
    const report = fixture("valid-report.json");
    const output = convertToMarkdown(report);
    expect(output).toContain('tags: ["testing", "automation"]');
  });

  it("omits tags when metadata is absent", () => {
    const report = fixture("minimal-report.json");
    const output = convertToMarkdown(report);
    expect(output).not.toContain("tags:");
  });

  it("renders text sections with heading", () => {
    const report = {
      title: "T",
      sections: [{ type: "text", heading: "Intro", level: 3, content: "Hello" }],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("### Intro");
    expect(output).toContain("Hello");
  });

  it("defaults text level to 2", () => {
    const report = {
      title: "T",
      sections: [{ type: "text", heading: "Intro", content: "Body" }],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("## Intro");
  });

  it("renders table with caption and rows", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "table",
          caption: "Data",
          headers: ["X", "Y"],
          rows: [
            ["1", "2"],
            ["3", "4"],
          ],
        },
      ],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("**Data**");
    expect(output).toContain("| X | Y |");
    expect(output).toContain("| --- | --- |");
    expect(output).toContain("| 1 | 2 |");
    expect(output).toContain("| 3 | 4 |");
  });

  it("renders table without caption", () => {
    const report = {
      title: "T",
      sections: [{ type: "table", headers: ["A"], rows: [["1"]] }],
    };
    const output = convertToMarkdown(report);
    expect(output).not.toContain("**");
    expect(output).toContain("| A |");
  });

  it("renders code with filename and language", () => {
    const report = {
      title: "T",
      sections: [{ type: "code", language: "js", filename: "index.js", code: "const x = 1;" }],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("*index.js*");
    expect(output).toContain("```js");
    expect(output).toContain("const x = 1;");
    expect(output).toContain("```");
  });

  it("renders code without language or filename", () => {
    const report = {
      title: "T",
      sections: [{ type: "code", code: "hello" }],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("```\nhello\n```");
    expect(output).not.toContain("*");
  });

  it("renders callout with title", () => {
    const report = {
      title: "T",
      sections: [{ type: "callout", variant: "warning", title: "Watch out", content: "Danger" }],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("> **Warning: Watch out**");
    expect(output).toContain("> Danger");
  });

  it("renders callout without title", () => {
    const report = {
      title: "T",
      sections: [{ type: "callout", variant: "info", content: "Note this" }],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("> **Info:**");
    expect(output).toContain("> Note this");
  });

  it("renders multiline callout content", () => {
    const report = {
      title: "T",
      sections: [{ type: "callout", variant: "success", content: "Line 1\nLine 2\nLine 3" }],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("> Line 1");
    expect(output).toContain("> Line 2");
    expect(output).toContain("> Line 3");
  });

  it("renders chart as markdown table", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "chart",
          chartType: "bar",
          title: "Sales",
          data: {
            labels: ["Jan", "Feb"],
            datasets: [{ label: "Revenue", data: [100, 200] }],
          },
        },
      ],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("## Sales");
    expect(output).toContain("*Chart type: bar*");
    expect(output).toContain("| Label | Revenue |");
    expect(output).toContain("| Jan | 100 |");
    expect(output).toContain("| Feb | 200 |");
  });

  it("renders chart with multiple datasets", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "chart",
          chartType: "line",
          data: {
            labels: ["Q1"],
            datasets: [
              { label: "A", data: [10] },
              { label: "B", data: [20] },
            ],
          },
        },
      ],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("| Label | A | B |");
    expect(output).toContain("| Q1 | 10 | 20 |");
  });

  it("handles missing data points in chart datasets", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "chart",
          chartType: "bar",
          data: {
            labels: ["A", "B"],
            datasets: [{ label: "Val", data: [1] }],
          },
        },
      ],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("| B |  |");
  });

  it("uses 'Value' as default dataset label", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "chart",
          chartType: "pie",
          data: {
            labels: ["X"],
            datasets: [{ data: [5] }],
          },
        },
      ],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("| Label | Value |");
  });

  it("renders tabs with text sections", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "tabs",
          tabs: [
            { label: "One", sections: [{ type: "text", content: "First tab" }] },
            { label: "Two", sections: [{ type: "text", content: "Second tab" }] },
          ],
        },
      ],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("### Tab: One");
    expect(output).toContain("First tab");
    expect(output).toContain("### Tab: Two");
    expect(output).toContain("Second tab");
  });

  it("renders tabs with mixed section types", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "tabs",
          tabs: [
            { label: "Summary", sections: [{ type: "text", content: "Overview text" }] },
            {
              label: "Data",
              sections: [
                { type: "statcard", label: "Users", value: 12500, trend: "up", trendValue: "+15%" },
                { type: "table", headers: ["A", "B"], rows: [["1", "2"]] },
              ],
            },
          ],
        },
      ],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("### Tab: Summary");
    expect(output).toContain("Overview text");
    expect(output).toContain("### Tab: Data");
    expect(output).toContain("**Users**: 12500");
    expect(output).toContain("| A | B |");
    expect(output).toContain("| 1 | 2 |");
  });

  it("renders tabs with code sections", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "tabs",
          tabs: [
            { label: "A", sections: [{ type: "text", content: "text" }] },
            {
              label: "Code",
              sections: [{ type: "code", language: "python", code: "print('hello')" }],
            },
          ],
        },
      ],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("### Tab: Code");
    expect(output).toContain("```python");
    expect(output).toContain("print('hello')");
  });

  it("renders comparison with title and variants", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "comparison",
          title: "Options",
          items: [
            { label: "Plan A", highlights: ["Fast", "Scalable"], variant: "positive" },
            { label: "Plan B", highlights: ["Cheap"], variant: "negative" },
          ],
        },
      ],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("### Options");
    expect(output).toContain("**Plan A** (+)");
    expect(output).toContain("- Fast");
    expect(output).toContain("- Scalable");
    expect(output).toContain("**Plan B** (-)");
    expect(output).toContain("- Cheap");
  });

  it("renders comparison without title or variant", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "comparison",
          items: [
            { label: "A", highlights: ["x"] },
            { label: "B", highlights: ["y"] },
          ],
        },
      ],
    };
    const output = convertToMarkdown(report);
    expect(output).not.toContain("###");
    expect(output).toContain("**A**\n");
    expect(output).toContain("**B**\n");
  });

  it("renders progress bar mode", () => {
    const report = {
      title: "T",
      sections: [{ type: "progress", mode: "bar", label: "Upload", value: 75, max: 100 }],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("**Upload**: 75/100 (75%)");
  });

  it("renders progress bar without label", () => {
    const report = {
      title: "T",
      sections: [{ type: "progress", value: 50 }],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("**Completion**: 50/100 (50%)");
  });

  it("renders progress milestones mode", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "progress",
          mode: "milestones",
          items: [
            { label: "Research", completed: true },
            { label: "Review", current: true },
            { label: "Publish" },
          ],
        },
      ],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("\u2713 Research");
    expect(output).toContain("\u25CF Review");
    expect(output).toContain("\u25CB Publish");
  });

  it("renders metrics-grid", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "metrics-grid",
          metrics: [
            { label: "Users", value: 1200, trend: "up", trendValue: "+5%" },
            { label: "Revenue", value: "$50k" },
          ],
        },
      ],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("**Users**: 1200 \u2191 +5%");
    expect(output).toContain("**Revenue**: $50k");
  });

  it("renders steps with currentStep", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "steps",
          currentStep: 1,
          steps: [
            { title: "Research", description: "Gather data" },
            { title: "Analyze" },
            { title: "Publish" },
          ],
        },
      ],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("1. [\u2713] Research \u2014 Gather data");
    expect(output).toContain("2. [\u2192] Analyze");
    expect(output).toContain("3. [ ] Publish");
  });

  it("renders steps without currentStep", () => {
    const report = {
      title: "T",
      sections: [{ type: "steps", steps: [{ title: "Step 1" }, { title: "Step 2" }] }],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("1. [ ] Step 1");
    expect(output).toContain("2. [ ] Step 2");
  });

  it("renders diff with title and language", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "diff",
          title: "Fix",
          language: "js",
          before: "const x = 1;",
          after: "const x = 2;",
        },
      ],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("### Fix");
    expect(output).toContain("**Before:**");
    expect(output).toContain("```js\nconst x = 1;\n```");
    expect(output).toContain("**After:**");
    expect(output).toContain("```js\nconst x = 2;\n```");
  });

  it("renders diff without title or language", () => {
    const report = {
      title: "T",
      sections: [{ type: "diff", before: "old", after: "new" }],
    };
    const output = convertToMarkdown(report);
    expect(output).not.toContain("###");
    expect(output).toContain("```\nold\n```");
    expect(output).toContain("```\nnew\n```");
  });

  it("renders embed with title", () => {
    const report = {
      title: "T",
      sections: [{ type: "embed", src: "https://example.com", title: "Demo" }],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("[Demo](https://example.com)");
  });

  it("renders embed without title", () => {
    const report = {
      title: "T",
      sections: [{ type: "embed", src: "https://example.com" }],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("[Embedded content](https://example.com)");
  });

  it("renders gallery with captions", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "gallery",
          images: [
            { src: "a.jpg", alt: "Photo A", caption: "First photo" },
            { src: "b.jpg", alt: "Photo B" },
          ],
        },
      ],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("![Photo A](a.jpg)");
    expect(output).toContain("*First photo*");
    expect(output).toContain("![Photo B](b.jpg)");
  });

  it("renders source-list with all fields", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "source-list",
          title: "References",
          sources: [
            {
              id: "1",
              title: "Paper One",
              author: "Smith",
              date: "2025",
              url: "https://example.com",
            },
            { id: "2", title: "Paper Two" },
          ],
        },
      ],
    };
    const output = convertToMarkdown(report);
    expect(output).toContain("### References");
    expect(output).toContain("1. [1] **Paper One** \u2014 Smith (2025) https://example.com");
    expect(output).toContain("2. [2] **Paper Two**");
  });

  it("renders source-list without title", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "source-list",
          sources: [{ id: "a", title: "Source" }],
        },
      ],
    };
    const output = convertToMarkdown(report);
    expect(output).not.toContain("###");
    expect(output).toContain("1. [a] **Source**");
  });
});
