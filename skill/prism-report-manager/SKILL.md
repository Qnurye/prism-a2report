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
  Node.js, pnpm, wrangler CLI, and internet access for deployment.
metadata:
  author: qnurye
  version: "1.0.0"
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
- Wrangler authenticated: `wrangler login`

## Deploying a Report

### Step 1: Create Report JSON

Write a JSON file following the A2UI format. See `references/A2UI_FORMAT.md`
for the full specification, or `assets/example-simple-report.json` for a
minimal example.

### Step 2: Deploy

```bash
cd ~/Projects/prism-a2report
./scripts/deploy-report.sh /path/to/report.json [optional-slug]
```

The script will:

1. Validate the JSON against `references/REPORT_SCHEMA.json`
2. Convert JSON to MDX
3. Generate both HTML and Markdown outputs
4. Build the Astro site
5. Deploy to Cloudflare Pages
6. Print the public URL

### Step 3: Verify

```bash
# Human-readable
open https://prism.qnury.es/reports/<slug>

# AI-readable
curl https://prism.qnury.es/reports/<slug>
```

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
