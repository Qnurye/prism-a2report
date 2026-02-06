# Deployment Guide

Step-by-step instructions for deploying a report to prism.qnury.es.

## Prerequisites

1. **Node.js** — Install via FNM (`fnm install`)
2. **pnpm** — Install via `corepack enable && corepack prepare pnpm@latest --activate`
3. **Wrangler CLI** — Install via `pnpm add -g wrangler` and authenticate with `wrangler login`
4. **Project dependencies** — Run `pnpm install` in `~/Projects/prism-a2report`

## Step 1: Create Report JSON

Write a JSON file following the A2UI format. The file must have at minimum:

```json
{
  "title": "Your Report Title",
  "sections": [
    {
      "type": "text",
      "content": "Your report content here..."
    }
  ]
}
```

See `A2UI_FORMAT.md` for all supported section types and fields. See `assets/example-simple-report.json` for a minimal example or `assets/example-full-report.json` for a comprehensive one.

## Step 2: Validate the Report

```bash
cd ~/Projects/prism-a2report
node scripts/validate-report.js /path/to/report.json
```

This validates the JSON against the schema. Fix any errors before proceeding.

## Step 3: Run the Deploy Script

```bash
./scripts/deploy-report.sh /path/to/report.json my-report-slug
```

The deploy script will:

1. Validate the JSON against the schema
2. Convert JSON to MDX (for HTML rendering)
3. Convert JSON to Markdown (for AI-readable output)
4. Pack the skill tarball
5. Build the Astro site
6. Deploy to Cloudflare Pages via Wrangler

If no slug is provided, one is auto-generated from the current timestamp.

## Step 4: Verify the Deployment

```bash
# View in browser (HTML)
open https://prism.qnury.es/reports/<slug>

# Fetch AI-readable version (Markdown)
curl https://prism.qnury.es/reports/<slug>

# List all deployed reports
./scripts/list-reports.sh
```

## Troubleshooting

- **Validation errors**: Check `A2UI_FORMAT.md` for required fields per section type
- **Build errors**: Run `pnpm install` to ensure dependencies are up to date
- **Deploy errors**: Run `wrangler login` to re-authenticate
