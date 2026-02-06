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

function renderTable(lines, s) {
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

function renderCode(lines, s) {
  if (s.filename) {
    lines.push(`*${s.filename}*`);
    lines.push("");
  }
  lines.push(`\`\`\`${s.language || ""}`);
  lines.push(s.code);
  lines.push("```");
  lines.push("");
}

function renderCallout(lines, s) {
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

function renderChart(lines, s) {
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

function renderStatCard(lines, s) {
  const trendArrows = { up: "\u2191", down: "\u2193", neutral: "\u2192" };
  let line = `**${s.label}**: ${s.value}`;
  if (s.trend && s.trendValue) {
    line += ` ${trendArrows[s.trend] || ""} ${s.trendValue}`;
  }
  lines.push(line);
  if (s.description) {
    lines.push(`*${s.description}*`);
  }
  lines.push("");
}

function renderTabs(lines, s) {
  for (const tab of s.tabs) {
    lines.push(`### Tab: ${tab.label}`);
    lines.push("");
    lines.push(tab.content);
    lines.push("");
  }
}

function renderTimeline(lines, s) {
  for (const event of s.events) {
    lines.push(`**${event.date}** \u2014 ${event.title}`);
    if (event.description) {
      lines.push("");
      lines.push(event.description);
    }
    lines.push("");
  }
}

function renderFigure(lines, s) {
  lines.push(`![${s.alt}](${s.src})`);
  if (s.caption) {
    lines.push(`*${s.caption}*`);
  }
  lines.push("");
}

function renderQuote(lines, s) {
  lines.push(`> ${s.text}`);
  lines.push(">");
  const attribution = s.role ? `\u2014 ${s.author}, ${s.role}` : `\u2014 ${s.author}`;
  lines.push(`> ${attribution}`);
  lines.push("");
}

function renderAccordion(lines, s) {
  for (const item of s.items) {
    lines.push(`### ${item.title}`);
    lines.push("");
    lines.push(item.content);
    lines.push("");
  }
}

export function convertToMarkdown(report) {
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
        renderText(lines, section);
        break;
      case "table":
        renderTable(lines, section);
        break;
      case "code":
        renderCode(lines, section);
        break;
      case "callout":
        renderCallout(lines, section);
        break;
      case "chart":
        renderChart(lines, section);
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
    }
  }

  return lines.join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const jsonPath = process.argv[2];
  const slug = process.argv[3];

  if (!jsonPath || !slug) {
    console.error("Usage: node scripts/json-to-markdown.js <report.json> <slug>");
    process.exit(1);
  }

  const report = JSON.parse(readFileSync(resolve(jsonPath), "utf-8"));
  const output = convertToMarkdown(report);

  const outDir = resolve(__dirname, `../src/content/reports/${slug}`);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, "index.md"), output);
  console.log(`Markdown written to src/content/reports/${slug}/index.md`);
}
