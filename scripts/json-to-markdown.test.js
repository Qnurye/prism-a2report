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
});
