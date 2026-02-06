---
name: prism-report-manager
description: >
  Generate, deploy, and manage AI research reports on prism.qnury.es.
  Reports are deployed as static sites with both human-readable (HTML) and
  AI-readable (Markdown) formats. Use when conducting research that needs
  to be published, when reading existing reports, or when managing the
  report archive.
license: MIT
compatibility: >
  Requires local filesystem access to ~/Projects/prism-a2report,
  Node.js, pnpm, git, and internet access for pushing to the remote.
metadata:
  author: qnurye
  version: "2.0.0"
  site: https://prism.qnury.es
allowed-tools: Bash Read Write
---

# Prism Report Manager

Deploy AI-generated research reports as interactive web documents.

## When to use this skill

- You need to publish research findings as a web report
- You want to read or reference a previously deployed report
- You need to list, search, or manage existing reports

## Prerequisites

This skill operates on the local filesystem. Ensure:

- Working directory: `~/Projects/prism-a2report`
- Dependencies installed: `pnpm install`
- Git configured with push access to the repo

## Deploying a Report

### Step 1: Create Report JSON

Write a JSON file following the A2UI format. See `references/A2UI_FORMAT.md`
for the full specification, or `assets/example-simple-report.json` for a
minimal example.

### Step 2: Validate

```bash
cd ~/Projects/prism-a2report
node scripts/validate-report.js /path/to/report.json
```

Fix any validation errors before proceeding.

### Step 3: Deploy via Git

```bash
cp /path/to/report.json reports/<slug>.json
git add reports/<slug>.json
git commit -m "feat: add <slug> report"
git push origin main
```

GitHub Actions will automatically:

1. Validate all report JSON files
2. Generate MDX and Markdown from each report
3. Build the Astro site
4. Copy AI-readable Markdown into the dist output
5. Deploy to Cloudflare Pages

The report will be available at `https://prism.qnury.es/reports/<slug>` once
the workflow completes.

## Reading Reports

```bash
# List all deployed reports
./scripts/list-reports.sh

# Read a specific report (returns Markdown)
curl https://prism.qnury.es/reports/<slug>
```

## Report Format Reference

See `references/A2UI_FORMAT.md` for supported section types:

- `text` — Markdown content with optional heading
- `chart` — Chart.js chart (line, bar, pie, doughnut)
- `table` — Responsive data table
- `code` — Syntax-highlighted code block
- `callout` — Info/warning/success/error callout box
- `statcard` — Metric display with trend indicator
- `tabs` — Tabbed content panels
- `timeline` — Chronological event display
- `figure` — Image with optional caption
- `quote` — Blockquote with author attribution
- `accordion` — Expandable/collapsible sections
