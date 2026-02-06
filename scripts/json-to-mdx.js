import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function renderText(lines, s) {
  const level = s.level || 2;
  if (s.heading) {
    lines.push(`${"#".repeat(level)} ${s.heading}`);
    lines.push("");
  }
  lines.push(s.content);
  lines.push("");
}

function renderChart(lines, s) {
  const props = [];
  props.push(`chartType="${s.chartType}"`);
  props.push(`data={${JSON.stringify(s.data)}}`);
  if (s.options) {
    props.push(`options={${JSON.stringify(s.options)}}`);
  }
  lines.push(`<Chart ${props.join(" ")} />`);
  lines.push("");
}

function renderTable(lines, s) {
  const props = [];
  props.push(`headers={${JSON.stringify(s.headers)}}`);
  props.push(`rows={${JSON.stringify(s.rows)}}`);
  if (s.caption) {
    props.push(`caption=${JSON.stringify(s.caption)}`);
  }
  lines.push(`<Table ${props.join(" ")} />`);
  lines.push("");
}

function renderCallout(lines, s) {
  const attrs = [`variant="${s.variant}"`];
  if (s.title) {
    attrs.push(`title=${JSON.stringify(s.title)}`);
  }
  lines.push(`<Callout ${attrs.join(" ")}>`);
  lines.push(s.content);
  lines.push("</Callout>");
  lines.push("");
}

function renderCode(lines, s) {
  const props = [];
  if (s.language) props.push(`language="${s.language}"`);
  if (s.filename) props.push(`filename=${JSON.stringify(s.filename)}`);
  props.push(`code={${JSON.stringify(s.code)}}`);
  lines.push(`<CodeBlock ${props.join(" ")} />`);
  lines.push("");
}

export function convertToMdx(report) {
  const lines = [];

  // YAML frontmatter
  lines.push("---");
  lines.push(`title: "${report.title}"`);
  if (report.author) lines.push(`author: "${report.author}"`);
  if (report.date) lines.push(`date: "${report.date}"`);
  lines.push("---");
  lines.push("");

  // Component imports
  lines.push("import Chart from '../../components/Chart.astro'");
  lines.push("import Table from '../../components/Table.astro'");
  lines.push("import Callout from '../../components/Callout.astro'");
  lines.push("import CodeBlock from '../../components/CodeBlock.astro'");
  lines.push("");

  // Sections
  for (const section of report.sections) {
    switch (section.type) {
      case "text":
        renderText(lines, section);
        break;
      case "chart":
        renderChart(lines, section);
        break;
      case "table":
        renderTable(lines, section);
        break;
      case "callout":
        renderCallout(lines, section);
        break;
      case "code":
        renderCode(lines, section);
        break;
    }
  }

  return lines.join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const jsonPath = process.argv[2];
  const slug = process.argv[3];

  if (!jsonPath || !slug) {
    console.error("Usage: node scripts/json-to-mdx.js <report.json> <slug>");
    process.exit(1);
  }

  const report = JSON.parse(readFileSync(resolve(jsonPath), "utf-8"));
  const output = convertToMdx(report);

  const outDir = resolve(__dirname, "../src/content/reports");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, `${slug}.mdx`), output);
  console.log(`MDX written to src/content/reports/${slug}.mdx`);
}
