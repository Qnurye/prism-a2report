import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const jsonPath = process.argv[2];
const slug = process.argv[3];

if (!jsonPath || !slug) {
  console.error("Usage: node scripts/json-to-markdown.js <report.json> <slug>");
  process.exit(1);
}

const report = JSON.parse(readFileSync(resolve(jsonPath), "utf-8"));

const lines = [];

// YAML frontmatter
lines.push("---");
lines.push(`title: "${report.title}"`);
if (report.author) lines.push(`author: "${report.author}"`);
if (report.date) lines.push(`date: "${report.date}"`);
if (report.metadata?.tags) {
  lines.push(`tags: [${report.metadata.tags.map((t) => `"${t}"`).join(", ")}]`);
}
lines.push("---");
lines.push("");

// Sections
for (const section of report.sections) {
  switch (section.type) {
    case "text":
      renderText(section);
      break;
    case "table":
      renderTable(section);
      break;
    case "code":
      renderCode(section);
      break;
    case "callout":
      renderCallout(section);
      break;
    case "chart":
      renderChart(section);
      break;
  }
}

function renderText(s) {
  const level = s.level || 2;
  if (s.heading) {
    lines.push(`${"#".repeat(level)} ${s.heading}`);
    lines.push("");
  }
  lines.push(s.content);
  lines.push("");
}

function renderTable(s) {
  if (s.caption) {
    lines.push(`**${s.caption}**`);
    lines.push("");
  }
  lines.push(`| ${s.headers.join(" | ")} |`);
  lines.push(`| ${s.headers.map(() => "---").join(" | ")} |`);
  for (const row of s.rows) {
    lines.push(`| ${row.join(" | ")} |`);
  }
  lines.push("");
}

function renderCode(s) {
  if (s.filename) {
    lines.push(`*${s.filename}*`);
    lines.push("");
  }
  lines.push(`\`\`\`${s.language || ""}`);
  lines.push(s.code);
  lines.push("```");
  lines.push("");
}

function renderCallout(s) {
  const prefix = s.variant.charAt(0).toUpperCase() + s.variant.slice(1);
  if (s.title) {
    lines.push(`> **${prefix}: ${s.title}**`);
  } else {
    lines.push(`> **${prefix}:**`);
  }
  for (const line of s.content.split("\n")) {
    lines.push(`> ${line}`);
  }
  lines.push("");
}

function renderChart(s) {
  if (s.title) {
    lines.push(`## ${s.title}`);
    lines.push("");
  }
  lines.push(`*Chart type: ${s.chartType}*`);
  lines.push("");

  // Render chart data as a Markdown table
  const data = s.data;
  if (data.labels && data.datasets) {
    const headers = ["Label", ...data.datasets.map((ds) => ds.label || "Value")];
    lines.push(`| ${headers.join(" | ")} |`);
    lines.push(`| ${headers.map(() => "---").join(" | ")} |`);
    for (let i = 0; i < data.labels.length; i++) {
      const row = [data.labels[i], ...data.datasets.map((ds) => String(ds.data[i] ?? ""))];
      lines.push(`| ${row.join(" | ")} |`);
    }
    lines.push("");
  }
}

const outDir = resolve(__dirname, `../src/content/reports/${slug}`);
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, "index.md"), lines.join("\n"));
console.log(`Markdown written to src/content/reports/${slug}/index.md`);
