interface Section {
  type: string;
  [key: string]: unknown;
}

interface Report {
  title: string;
  author?: string;
  date?: string;
  metadata?: {
    tags?: string[];
    category?: string;
  };
  sections: Section[];
}

function renderText(lines: string[], s: Record<string, unknown>) {
  const level = (s.level as number) || 2;
  if (s.heading) {
    lines.push(`${"#".repeat(level)} ${s.heading}`);
    lines.push("");
  }
  lines.push(s.content as string);
  lines.push("");
}

function renderTable(lines: string[], s: Record<string, unknown>) {
  if (s.caption) {
    lines.push(`**${s.caption}**`);
    lines.push("");
  }
  const headers = s.headers as string[];
  const rows = s.rows as string[][];
  lines.push(`| ${headers.join(" | ")} |`);
  lines.push(`| ${headers.map(() => "---").join(" | ")} |`);
  for (const row of rows) {
    lines.push(`| ${row.join(" | ")} |`);
  }
  lines.push("");
}

function renderCode(lines: string[], s: Record<string, unknown>) {
  if (s.filename) {
    lines.push(`*${s.filename}*`);
    lines.push("");
  }
  lines.push(`\`\`\`${(s.language as string) || ""}`);
  lines.push(s.code as string);
  lines.push("```");
  lines.push("");
}

function renderCallout(lines: string[], s: Record<string, unknown>) {
  const variant = s.variant as string;
  const prefix = variant.charAt(0).toUpperCase() + variant.slice(1);
  if (s.title) {
    lines.push(`> **${prefix}: ${s.title}**`);
  } else {
    lines.push(`> **${prefix}:**`);
  }
  for (const line of (s.content as string).split("\n")) {
    lines.push(`> ${line}`);
  }
  lines.push("");
}

function renderChart(lines: string[], s: Record<string, unknown>) {
  if (s.title) {
    lines.push(`## ${s.title}`);
    lines.push("");
  }
  lines.push(`*Chart type: ${s.chartType}*`);
  lines.push("");

  const data = s.data as { labels?: string[]; datasets?: { label?: string; data: unknown[] }[] };
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

function renderStatCard(lines: string[], s: Record<string, unknown>) {
  const trendArrows: Record<string, string> = { up: "\u2191", down: "\u2193", neutral: "\u2192" };
  let line = `**${s.label}**: ${s.value}`;
  if (s.trend && s.trendValue) {
    line += ` ${trendArrows[s.trend as string] || ""} ${s.trendValue}`;
  }
  lines.push(line);
  if (s.description) {
    lines.push(`*${s.description}*`);
  }
  lines.push("");
}

function renderSection(lines: string[], section: Record<string, unknown>) {
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

function renderTabs(lines: string[], s: Record<string, unknown>) {
  const tabs = s.tabs as { label: string; sections: Record<string, unknown>[] }[];
  for (const tab of tabs) {
    lines.push(`### Tab: ${tab.label}`);
    lines.push("");
    for (const section of tab.sections) {
      renderSection(lines, section);
    }
  }
}

function renderTimeline(lines: string[], s: Record<string, unknown>) {
  const events = s.events as { date: string; title: string; description?: string }[];
  for (const event of events) {
    lines.push(`**${event.date}** \u2014 ${event.title}`);
    if (event.description) {
      lines.push("");
      lines.push(event.description);
    }
    lines.push("");
  }
}

function renderFigure(lines: string[], s: Record<string, unknown>) {
  lines.push(`![${s.alt}](${s.src})`);
  if (s.caption) {
    lines.push(`*${s.caption}*`);
  }
  lines.push("");
}

function renderQuote(lines: string[], s: Record<string, unknown>) {
  lines.push(`> ${s.text}`);
  lines.push(">");
  const attribution = s.role ? `\u2014 ${s.author}, ${s.role}` : `\u2014 ${s.author}`;
  lines.push(`> ${attribution}`);
  lines.push("");
}

function renderAccordion(lines: string[], s: Record<string, unknown>) {
  const items = s.items as { title: string; content: string }[];
  for (const item of items) {
    lines.push(`### ${item.title}`);
    lines.push("");
    lines.push(item.content);
    lines.push("");
  }
}

function renderComparison(lines: string[], s: Record<string, unknown>) {
  if (s.title) {
    lines.push(`### ${s.title}`);
    lines.push("");
  }
  const items = s.items as { label: string; highlights: string[]; variant?: string }[];
  for (const item of items) {
    const variantLabel =
      item.variant === "positive" ? " (+)" : item.variant === "negative" ? " (-)" : "";
    lines.push(`**${item.label}**${variantLabel}`);
    lines.push("");
    for (const h of item.highlights) {
      lines.push(`- ${h}`);
    }
    lines.push("");
  }
}

function renderProgress(lines: string[], s: Record<string, unknown>) {
  const mode = (s.mode as string) || "bar";
  if (mode === "bar") {
    const value = (s.value as number) || 0;
    const max = (s.max as number) || 100;
    const percent = Math.round((value / max) * 100);
    if (s.label) {
      lines.push(`**${s.label}**: ${value}/${max} (${percent}%)`);
    } else {
      lines.push(`**Completion**: ${value}/${max} (${percent}%)`);
    }
  } else {
    const items = (s.items as { label: string; completed?: boolean; current?: boolean }[]) || [];
    const parts = items.map((item) => {
      if (item.completed) return `\u2713 ${item.label}`;
      if (item.current) return `\u25CF ${item.label}`;
      return `\u25CB ${item.label}`;
    });
    lines.push(parts.join(" \u2192 "));
  }
  lines.push("");
}

function renderMetricsGrid(lines: string[], s: Record<string, unknown>) {
  const trendArrows: Record<string, string> = { up: "\u2191", down: "\u2193", neutral: "\u2192" };
  const metrics = s.metrics as {
    label: string;
    value: unknown;
    trend?: string;
    trendValue?: string;
  }[];
  for (const metric of metrics) {
    let line = `**${metric.label}**: ${metric.value}`;
    if (metric.trend && metric.trendValue) {
      line += ` ${trendArrows[metric.trend] || ""} ${metric.trendValue}`;
    }
    lines.push(line);
  }
  lines.push("");
}

function renderSteps(lines: string[], s: Record<string, unknown>) {
  const currentStep = s.currentStep as number | undefined;
  const steps = s.steps as { title: string; description?: string }[];
  steps.forEach((step, index) => {
    let marker;
    if (currentStep !== undefined && index < currentStep) {
      marker = "\u2713";
    } else if (currentStep !== undefined && index === currentStep) {
      marker = "\u2192";
    } else {
      marker = " ";
    }
    let line = `${index + 1}. [${marker}] ${step.title}`;
    if (step.description) {
      line += ` \u2014 ${step.description}`;
    }
    lines.push(line);
  });
  lines.push("");
}

function renderDiff(lines: string[], s: Record<string, unknown>) {
  if (s.title) {
    lines.push(`### ${s.title}`);
    lines.push("");
  }
  lines.push("**Before:**");
  lines.push("");
  lines.push(`\`\`\`${(s.language as string) || ""}`);
  lines.push(s.before as string);
  lines.push("```");
  lines.push("");
  lines.push("**After:**");
  lines.push("");
  lines.push(`\`\`\`${(s.language as string) || ""}`);
  lines.push(s.after as string);
  lines.push("```");
  lines.push("");
}

function renderEmbed(lines: string[], s: Record<string, unknown>) {
  const label = (s.title as string) || "Embedded content";
  lines.push(`[${label}](${s.src})`);
  lines.push("");
}

function renderGallery(lines: string[], s: Record<string, unknown>) {
  const images = s.images as { alt: string; src: string; caption?: string }[];
  for (const image of images) {
    lines.push(`![${image.alt}](${image.src})`);
    if (image.caption) {
      lines.push(`*${image.caption}*`);
    }
    lines.push("");
  }
}

function renderSourceList(lines: string[], s: Record<string, unknown>) {
  if (s.title) {
    lines.push(`### ${s.title}`);
    lines.push("");
  }
  const sources = s.sources as {
    id: string;
    title: string;
    author?: string;
    date?: string;
    url?: string;
  }[];
  sources.forEach((source, index) => {
    let line = `${index + 1}. [${source.id}] **${source.title}**`;
    if (source.author) line += ` \u2014 ${source.author}`;
    if (source.date) line += ` (${source.date})`;
    if (source.url) line += ` ${source.url}`;
    lines.push(line);
  });
  lines.push("");
}

export function convertToMarkdown(report: Report): string {
  const lines: string[] = [];

  lines.push("---");
  lines.push(`title: "${report.title}"`);
  if (report.author) lines.push(`author: "${report.author}"`);
  if (report.date) lines.push(`date: "${report.date}"`);
  if (report.metadata?.tags) {
    lines.push(`tags: [${report.metadata.tags.map((t) => `"${t}"`).join(", ")}]`);
  }
  lines.push("---");
  lines.push("");

  for (const section of report.sections) {
    renderSection(lines, section as Record<string, unknown>);
  }

  return lines.join("\n");
}
