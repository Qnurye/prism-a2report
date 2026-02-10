import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { convertToMdx, escapeMdxContent, detectCJKLang } from "./json-to-mdx.js";

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

  it("includes new component imports", () => {
    const report = { title: "T", sections: [{ type: "text", content: "Hi" }] };
    const output = convertToMdx(report);
    expect(output).toContain("import Comparison from '../../components/Comparison.astro'");
    expect(output).toContain("import Progress from '../../components/Progress.astro'");
    expect(output).toContain("import MetricsGrid from '../../components/MetricsGrid.astro'");
    expect(output).toContain("import Steps from '../../components/Steps.astro'");
    expect(output).toContain("import Diff from '../../components/Diff.astro'");
    expect(output).toContain("import Embed from '../../components/Embed.astro'");
    expect(output).toContain("import Gallery from '../../components/Gallery.astro'");
    expect(output).toContain("import SourceList from '../../components/SourceList.astro'");
  });

  it("renders comparison sections", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "comparison",
          title: "Compare",
          layout: "stacked",
          items: [
            { label: "A", highlights: ["Fast"], variant: "positive" },
            { label: "B", highlights: ["Cheap"] },
          ],
        },
      ],
    };
    const output = convertToMdx(report);
    expect(output).toContain("<Comparison");
    expect(output).toContain("items={[");
    expect(output).toContain('title="Compare"');
    expect(output).toContain('layout="stacked"');
  });

  it("renders progress bar sections", () => {
    const report = {
      title: "T",
      sections: [
        { type: "progress", mode: "bar", label: "Upload", value: 75, max: 100, showPercent: true },
      ],
    };
    const output = convertToMdx(report);
    expect(output).toContain("<Progress");
    expect(output).toContain('mode="bar"');
    expect(output).toContain("value={75}");
    expect(output).toContain("max={100}");
    expect(output).toContain("showPercent={true}");
  });

  it("renders progress milestones sections", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "progress",
          mode: "milestones",
          items: [{ label: "Start", completed: true }, { label: "End" }],
        },
      ],
    };
    const output = convertToMdx(report);
    expect(output).toContain("<Progress");
    expect(output).toContain('mode="milestones"');
    expect(output).toContain("items={");
  });

  it("renders metrics-grid sections", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "metrics-grid",
          columns: 4,
          metrics: [{ label: "Users", value: 100, trend: "up", trendValue: "+5%" }],
        },
      ],
    };
    const output = convertToMdx(report);
    expect(output).toContain("<MetricsGrid");
    expect(output).toContain("metrics={");
    expect(output).toContain("columns={4}");
  });

  it("renders steps sections", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "steps",
          orientation: "vertical",
          currentStep: 1,
          steps: [{ title: "Plan" }, { title: "Execute" }],
        },
      ],
    };
    const output = convertToMdx(report);
    expect(output).toContain("<Steps");
    expect(output).toContain("steps={");
    expect(output).toContain('orientation="vertical"');
    expect(output).toContain("currentStep={1}");
  });

  it("renders diff sections", () => {
    const report = {
      title: "T",
      sections: [
        { type: "diff", before: "x = 1", after: "x = 2", language: "python", title: "Change" },
      ],
    };
    const output = convertToMdx(report);
    expect(output).toContain("<Diff");
    expect(output).toContain("before={");
    expect(output).toContain("after={");
    expect(output).toContain('language="python"');
    expect(output).toContain('title="Change"');
  });

  it("renders embed sections", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "embed",
          src: "https://example.com",
          title: "Demo",
          aspectRatio: "4:3",
          allowFullscreen: false,
        },
      ],
    };
    const output = convertToMdx(report);
    expect(output).toContain("<Embed");
    expect(output).toContain('src="https://example.com"');
    expect(output).toContain('title="Demo"');
    expect(output).toContain('aspectRatio="4:3"');
    expect(output).toContain("allowFullscreen={false}");
  });

  it("renders gallery sections", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "gallery",
          columns: 2,
          images: [{ src: "a.jpg", alt: "Photo A", caption: "Caption" }],
        },
      ],
    };
    const output = convertToMdx(report);
    expect(output).toContain("<Gallery");
    expect(output).toContain("images={");
    expect(output).toContain("columns={2}");
  });

  it("renders source-list sections", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "source-list",
          title: "References",
          sources: [{ id: "1", title: "Paper", url: "https://example.com", author: "Smith" }],
        },
      ],
    };
    const output = convertToMdx(report);
    expect(output).toContain("<SourceList");
    expect(output).toContain("sources={");
    expect(output).toContain('title="References"');
  });

  it("escapes curly braces in text content", () => {
    const report = {
      title: "T",
      sections: [{ type: "text", content: "Use {expr} here" }],
    };
    const output = convertToMdx(report);
    expect(output).toContain("Use \\{expr\\} here");
  });

  it("escapes < in non-tag context in text content", () => {
    const report = {
      title: "T",
      sections: [{ type: "text", content: "Performance <2%" }],
    };
    const output = convertToMdx(report);
    expect(output).toContain("Performance &lt;2%");
  });

  it("escapes special chars in text heading", () => {
    const report = {
      title: "T",
      sections: [{ type: "text", heading: "Results {x} <2%", content: "body" }],
    };
    const output = convertToMdx(report);
    expect(output).toContain("## Results \\{x\\} &lt;2%");
  });

  it("escapes special chars in callout content", () => {
    const report = {
      title: "T",
      sections: [{ type: "callout", variant: "info", content: "Config {key} and <5% threshold" }],
    };
    const output = convertToMdx(report);
    expect(output).toContain("Config \\{key\\} and &lt;5% threshold");
  });

  it("preserves valid HTML tags in text content", () => {
    const report = {
      title: "T",
      sections: [{ type: "text", content: "Has <em>emphasis</em> and <br> and </div>" }],
    };
    const output = convertToMdx(report);
    expect(output).toContain("<em>emphasis</em>");
    expect(output).toContain("<br>");
    expect(output).toContain("</div>");
  });

  it("escapes special chars from fixture", () => {
    const report = fixture("mdx-special-chars-report.json");
    const output = convertToMdx(report);
    // Section 0: heading and content should have escaped braces and <
    expect(output).toContain("\\{x\\}");
    expect(output).toContain("&lt;2%");
    // Section 1: valid HTML tags should remain
    expect(output).toContain("<em>valid HTML</em>");
    expect(output).toContain("<br>");
    // Section 2 (callout): should have escaped content
    expect(output).toContain("&lt;5%");
    expect(output).toContain("\\{key: value\\}");
  });
});

describe("detectCJKLang", () => {
  it("returns null for English text", () => {
    expect(detectCJKLang("This is a plain English report about technology")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(detectCJKLang("")).toBeNull();
  });

  it("detects Chinese content", () => {
    expect(detectCJKLang("中国独立电影发行市场分析报告")).toBe("zh");
  });

  it("detects Japanese content with kana", () => {
    expect(detectCJKLang("これはテストです。日本語のレポート")).toBe("ja");
  });

  it("detects Korean content", () => {
    expect(detectCJKLang("한국어 보고서 테스트입니다")).toBe("ko");
  });

  it("returns null for mixed text below 30% threshold", () => {
    // ~20% CJK in a mostly English text
    expect(detectCJKLang("This report discusses 中国 market trends in great detail")).toBeNull();
  });

  it("detects Chinese when CJK ratio exceeds threshold", () => {
    // Majority Chinese with some English
    expect(detectCJKLang("中国市场分析：独立电影的发行策略与未来趋势 Report")).toBe("zh");
  });

  it("prefers Japanese when kana count exceeds Chinese count", () => {
    expect(detectCJKLang("テストテストテストこれはテスト漢字")).toBe("ja");
  });
});

describe("convertToMdx CJK lang detection", () => {
  it("adds lang frontmatter for Chinese reports", () => {
    const report = {
      title: "中国独立电影发行市场分析",
      sections: [{ type: "text", content: "这是一份关于中国独立电影市场的分析报告" }],
    };
    const output = convertToMdx(report);
    expect(output).toContain('lang: "zh"');
  });

  it("does not add lang for English reports", () => {
    const report = {
      title: "Test Report",
      sections: [{ type: "text", content: "This is an English report" }],
    };
    const output = convertToMdx(report);
    expect(output).not.toContain("lang:");
  });
});

describe("escapeMdxContent", () => {
  it("escapes curly braces", () => {
    expect(escapeMdxContent("{value}")).toBe("\\{value\\}");
  });

  it("escapes < not followed by letter or /", () => {
    expect(escapeMdxContent("x <2")).toBe("x &lt;2");
    expect(escapeMdxContent("a < b")).toBe("a &lt; b");
  });

  it("preserves valid HTML tags", () => {
    expect(escapeMdxContent("<em>text</em>")).toBe("<em>text</em>");
    expect(escapeMdxContent("<br>")).toBe("<br>");
    expect(escapeMdxContent("</div>")).toBe("</div>");
  });

  it("handles mixed content", () => {
    expect(escapeMdxContent("Loss <2%, use {x}, and <em>bold</em>")).toBe(
      "Loss &lt;2%, use \\{x\\}, and <em>bold</em>",
    );
  });
});
