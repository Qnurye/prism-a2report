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

function renderStatCard(lines, s) {
  const props = [`label=${JSON.stringify(s.label)}`];
  if (typeof s.value === "number") {
    props.push(`value={${s.value}}`);
  } else {
    props.push(`value=${JSON.stringify(s.value)}`);
  }
  if (s.description) props.push(`description=${JSON.stringify(s.description)}`);
  if (s.trend) props.push(`trend="${s.trend}"`);
  if (s.trendValue) props.push(`trendValue=${JSON.stringify(s.trendValue)}`);
  lines.push(`<StatCard ${props.join(" ")} />`);
  lines.push("");
}

function renderTabs(lines, s) {
  const props = [`tabs={${JSON.stringify(s.tabs)}}`];
  if (s.defaultTab !== undefined) props.push(`defaultTab={${s.defaultTab}}`);
  lines.push(`<Tabs ${props.join(" ")} />`);
  lines.push("");
}

function renderTimeline(lines, s) {
  lines.push(`<Timeline events={${JSON.stringify(s.events)}} />`);
  lines.push("");
}

function renderFigure(lines, s) {
  const props = [`src=${JSON.stringify(s.src)}`, `alt=${JSON.stringify(s.alt)}`];
  if (s.caption) props.push(`caption=${JSON.stringify(s.caption)}`);
  if (s.width) props.push(`width=${JSON.stringify(s.width)}`);
  lines.push(`<Figure ${props.join(" ")} />`);
  lines.push("");
}

function renderQuote(lines, s) {
  const props = [`text=${JSON.stringify(s.text)}`, `author=${JSON.stringify(s.author)}`];
  if (s.role) props.push(`role=${JSON.stringify(s.role)}`);
  lines.push(`<Quote ${props.join(" ")} />`);
  lines.push("");
}

function renderAccordion(lines, s) {
  const props = [`items={${JSON.stringify(s.items)}}`];
  if (s.allowMultiple) props.push(`allowMultiple={true}`);
  lines.push(`<Accordion ${props.join(" ")} />`);
  lines.push("");
}

function renderComparison(lines, s) {
  const props = [`items={${JSON.stringify(s.items)}}`];
  if (s.title) props.push(`title=${JSON.stringify(s.title)}`);
  if (s.layout) props.push(`layout="${s.layout}"`);
  lines.push(`<Comparison ${props.join(" ")} />`);
  lines.push("");
}

function renderProgress(lines, s) {
  const props = [];
  if (s.mode) props.push(`mode="${s.mode}"`);
  if (s.label) props.push(`label=${JSON.stringify(s.label)}`);
  if (s.value !== undefined) props.push(`value={${s.value}}`);
  if (s.max !== undefined) props.push(`max={${s.max}}`);
  if (s.showPercent) props.push(`showPercent={true}`);
  if (s.variant) props.push(`variant="${s.variant}"`);
  if (s.items) props.push(`items={${JSON.stringify(s.items)}}`);
  lines.push(`<Progress ${props.join(" ")} />`);
  lines.push("");
}

function renderMetricsGrid(lines, s) {
  const props = [`metrics={${JSON.stringify(s.metrics)}}`];
  if (s.columns !== undefined) props.push(`columns={${s.columns}}`);
  lines.push(`<MetricsGrid ${props.join(" ")} />`);
  lines.push("");
}

function renderSteps(lines, s) {
  const props = [`steps={${JSON.stringify(s.steps)}}`];
  if (s.orientation) props.push(`orientation="${s.orientation}"`);
  if (s.currentStep !== undefined) props.push(`currentStep={${s.currentStep}}`);
  lines.push(`<Steps ${props.join(" ")} />`);
  lines.push("");
}

function renderDiff(lines, s) {
  const props = [`before={${JSON.stringify(s.before)}}`, `after={${JSON.stringify(s.after)}}`];
  if (s.language) props.push(`language="${s.language}"`);
  if (s.title) props.push(`title=${JSON.stringify(s.title)}`);
  lines.push(`<Diff ${props.join(" ")} />`);
  lines.push("");
}

function renderEmbed(lines, s) {
  const props = [`src=${JSON.stringify(s.src)}`];
  if (s.title) props.push(`title=${JSON.stringify(s.title)}`);
  if (s.aspectRatio) props.push(`aspectRatio="${s.aspectRatio}"`);
  if (s.allowFullscreen !== undefined) props.push(`allowFullscreen={${s.allowFullscreen}}`);
  lines.push(`<Embed ${props.join(" ")} />`);
  lines.push("");
}

function renderGallery(lines, s) {
  const props = [`images={${JSON.stringify(s.images)}}`];
  if (s.columns !== undefined) props.push(`columns={${s.columns}}`);
  lines.push(`<Gallery ${props.join(" ")} />`);
  lines.push("");
}

function renderSourceList(lines, s) {
  const props = [`sources={${JSON.stringify(s.sources)}}`];
  if (s.title) props.push(`title=${JSON.stringify(s.title)}`);
  lines.push(`<SourceList ${props.join(" ")} />`);
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
  lines.push("import StatCard from '../../components/StatCard.astro'");
  lines.push("import Tabs from '../../components/Tabs.astro'");
  lines.push("import Timeline from '../../components/Timeline.astro'");
  lines.push("import Figure from '../../components/Figure.astro'");
  lines.push("import Quote from '../../components/Quote.astro'");
  lines.push("import Accordion from '../../components/Accordion.astro'");
  lines.push("import Comparison from '../../components/Comparison.astro'");
  lines.push("import Progress from '../../components/Progress.astro'");
  lines.push("import MetricsGrid from '../../components/MetricsGrid.astro'");
  lines.push("import Steps from '../../components/Steps.astro'");
  lines.push("import Diff from '../../components/Diff.astro'");
  lines.push("import Embed from '../../components/Embed.astro'");
  lines.push("import Gallery from '../../components/Gallery.astro'");
  lines.push("import SourceList from '../../components/SourceList.astro'");
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
      case "statcard":
        renderStatCard(lines, section);
        break;
      case "tabs":
        renderTabs(lines, section);
        break;
      case "timeline":
        renderTimeline(lines, section);
        break;
      case "figure":
        renderFigure(lines, section);
        break;
      case "quote":
        renderQuote(lines, section);
        break;
      case "accordion":
        renderAccordion(lines, section);
        break;
      case "comparison":
        renderComparison(lines, section);
        break;
      case "progress":
        renderProgress(lines, section);
        break;
      case "metrics-grid":
        renderMetricsGrid(lines, section);
        break;
      case "steps":
        renderSteps(lines, section);
        break;
      case "diff":
        renderDiff(lines, section);
        break;
      case "embed":
        renderEmbed(lines, section);
        break;
      case "gallery":
        renderGallery(lines, section);
        break;
      case "source-list":
        renderSourceList(lines, section);
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
