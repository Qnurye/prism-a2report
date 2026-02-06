# Deployment Guide

Step-by-step instructions for deploying a report to prism.qnury.es.

## Prerequisites

1. **Node.js** — Install via FNM (`fnm install`)
2. **pnpm** — Install via `corepack enable && corepack prepare pnpm@latest --activate`
3. **Git** — With push access to the prism-a2report repository
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

## Step 3: Deploy via Git

Copy the validated JSON into the `reports/` directory and push:

```bash
cp /path/to/report.json reports/<slug>.json
git add reports/<slug>.json
git commit -m "feat: add <slug> report"
git push origin main
```

GitHub Actions will automatically:

1. Generate MDX and Markdown from all report JSON files
2. Build the Astro site
3. Copy AI-readable Markdown into the dist output
4. Deploy to Cloudflare Pages

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
- **Deploy failures**: Check the GitHub Actions tab for workflow logs and error details
