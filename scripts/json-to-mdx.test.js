import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { convertToMdx } from "./json-to-mdx.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = (name) =>
  JSON.parse(readFileSync(resolve(__dirname, "__fixtures__", name), "utf-8"));

describe("convertToMdx", () => {
  it("generates correct YAML frontmatter", () => {
    const report = fixture("valid-report.json");
    const output = convertToMdx(report);
    expect(output).toContain("---");
    expect(output).toContain('title: "Test Report"');
    expect(output).toContain('author: "Test Author"');
    expect(output).toContain('date: "2025-01-15"');
  });

  it("includes component imports", () => {
    const report = fixture("minimal-report.json");
    const output = convertToMdx(report);
    expect(output).toContain("import Chart from '../../components/Chart.astro'");
    expect(output).toContain("import Table from '../../components/Table.astro'");
    expect(output).toContain("import Callout from '../../components/Callout.astro'");
    expect(output).toContain("import CodeBlock from '../../components/CodeBlock.astro'");
  });

  it("renders text sections with heading and level", () => {
    const report = {
      title: "T",
      sections: [{ type: "text", heading: "Intro", level: 3, content: "Hello world" }],
    };
    const output = convertToMdx(report);
    expect(output).toContain("### Intro");
    expect(output).toContain("Hello world");
  });

  it("defaults text section level to 2", () => {
    const report = {
      title: "T",
      sections: [{ type: "text", heading: "Intro", content: "Body" }],
    };
    const output = convertToMdx(report);
    expect(output).toContain("## Intro");
  });

  it("renders text section without heading", () => {
    const report = {
      title: "T",
      sections: [{ type: "text", content: "Just text" }],
    };
    const output = convertToMdx(report);
    expect(output).toContain("Just text");
    expect(output).not.toContain("## ");
  });

  it("renders chart sections", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "chart",
          chartType: "bar",
          data: { labels: ["A"], datasets: [{ data: [1] }] },
          options: { responsive: true },
        },
      ],
    };
    const output = convertToMdx(report);
    expect(output).toContain('<Chart chartType="bar"');
    expect(output).toContain("data={");
    expect(output).toContain("options={");
    expect(output).toContain("/>");
  });

  it("renders chart without options", () => {
    const report = {
      title: "T",
      sections: [{ type: "chart", chartType: "line", data: { labels: [] } }],
    };
    const output = convertToMdx(report);
    expect(output).not.toContain("options=");
  });

  it("renders table sections with caption", () => {
    const report = {
      title: "T",
      sections: [{ type: "table", headers: ["A", "B"], rows: [["1", "2"]], caption: "My Table" }],
    };
    const output = convertToMdx(report);
    expect(output).toContain("<Table");
    expect(output).toContain('headers={["A","B"]}');
    expect(output).toContain('caption="My Table"');
  });

  it("renders callout sections", () => {
    const report = {
      title: "T",
      sections: [{ type: "callout", variant: "warning", title: "Heads up", content: "Be careful" }],
    };
    const output = convertToMdx(report);
    expect(output).toContain('<Callout variant="warning" title="Heads up">');
    expect(output).toContain("Be careful");
    expect(output).toContain("</Callout>");
  });

  it("renders code sections", () => {
    const report = {
      title: "T",
      sections: [{ type: "code", language: "python", filename: "app.py", code: "print('hi')" }],
    };
    const output = convertToMdx(report);
    expect(output).toContain('<CodeBlock language="python"');
    expect(output).toContain('filename="app.py"');
    expect(output).toContain("code={");
  });

  it("handles minimal report (no optional fields)", () => {
    const report = fixture("minimal-report.json");
    const output = convertToMdx(report);
    expect(output).toContain('title: "Minimal Report"');
    expect(output).not.toContain("author:");
    expect(output).not.toContain("date:");
    expect(output).toContain("Just a paragraph.");
  });

  it("renders tabs with sections as JSON props", () => {
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
    const output = convertToMdx(report);
    expect(output).toContain("<Tabs");
    expect(output).toContain('"label":"One"');
    expect(output).toContain('"sections"');
    expect(output).toContain('"type":"text"');
  });

  it("renders tabs with mixed section types", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "tabs",
          tabs: [
            { label: "Text", sections: [{ type: "text", content: "Simple" }] },
            {
              label: "Data",
              sections: [
                { type: "statcard", label: "Users", value: 100 },
                { type: "code", code: "x = 1" },
              ],
            },
          ],
        },
      ],
    };
    const output = convertToMdx(report);
    expect(output).toContain("<Tabs");
    expect(output).toContain('"type":"statcard"');
    expect(output).toContain('"type":"code"');
  });

  it("renders tabs with defaultTab", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "tabs",
          tabs: [
            { label: "A", sections: [{ type: "text", content: "a" }] },
            { label: "B", sections: [{ type: "text", content: "b" }] },
          ],
          defaultTab: 1,
        },
      ],
    };
    const output = convertToMdx(report);
    expect(output).toContain("defaultTab={1}");
  });
});
