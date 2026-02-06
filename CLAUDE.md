# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Prism A2Report is an Astro-based static site that publishes AI-generated research reports with dual-format output: interactive HTML for humans and plain Markdown for AI agents. Deployed to Cloudflare Pages at `prism.qnury.es`. A Cloudflare Pages middleware (`functions/_middleware.ts`) performs content negotiation — requests from curl/wget/AI bots receive Markdown instead of HTML.

## Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Build (runs prebuild to pack skill tarball first)
pnpm lint             # ESLint
pnpm lint:fix         # ESLint with auto-fix
pnpm format:check     # Prettier check
pnpm format           # Prettier write
pnpm test             # Run tests in watch mode
pnpm test:run         # Run tests once
pnpm test:coverage    # Run tests with coverage

# Report pipeline
node scripts/validate-report.js <report.json>        # Validate JSON against schema
node scripts/json-to-mdx.js <report.json> <slug>     # Generate MDX for Astro
node scripts/json-to-markdown.js <report.json> <slug> # Generate AI-readable Markdown
./scripts/deploy-report.sh <report.json> [slug]       # Full pipeline: validate → convert → build → deploy
./scripts/list-reports.sh                              # List deployed reports
./scripts/generate-all-reports.sh                      # Generate all reports from reports/*.json
./scripts/copy-markdown-to-dist.sh                     # Copy AI-readable Markdown into dist/
```

## Architecture

### Report Pipeline (JSON → dual output)

Reports are authored as JSON conforming to `schema/report.schema.json`, then converted into two formats:

1. **MDX** (`src/content/reports/<slug>.mdx`) — Rendered by Astro into interactive HTML with Chart.js charts, styled tables, syntax-highlighted code (Shiki), and callout boxes
2. **Markdown** (`src/content/reports/<slug>/index.md`) — Plain Markdown for AI consumption, copied into `dist/` during build

The JSON schema supports eleven section types: `text`, `chart`, `table`, `code`, `callout`, `statcard`, `tabs`, `timeline`, `figure`, `quote`, `accordion`.

**Generated report content is gitignored** — `src/content/reports/` is in `.gitignore`. Reports are generated at build/deploy time.

### Content Collection

Astro content collection (`src/content.config.ts`) uses glob loader to find `**/*.mdx` under `src/content/reports/`. Each MDX file uses frontmatter fields: `title` (required), `author`, `date`.

### Components (src/components/)

All components are Astro components used within MDX reports:

- **Chart.astro** — Client-side Chart.js rendering (line/bar/pie/doughnut), dark-mode aware
- **Table.astro** — Responsive data table with Tailwind styling
- **CodeBlock.astro** — Shiki syntax highlighting with dual-theme (one-light / one-dark-pro)
- **Callout.astro** — Styled aside with info/warning/success/error variants
- **StatCard.astro** — Metric display with optional trend indicator and count-up animation
- **Figure.astro** — Image with optional caption, lazy loading
- **Quote.astro** — Styled blockquote with author/role attribution
- **Tabs.astro** — WAI-ARIA tabbed content panels
- **Timeline.astro** — Vertical chronological event display with staggered animations
- **Accordion.astro** — Expandable/collapsible sections, single or multi-open mode

### Styling

Tailwind CSS v4 with class-based dark mode (`.dark` class on `<html>`). Theme tokens defined as CSS custom properties in `src/styles/global.css` using OKLCH color space. Four font families: `sans` (Inter + LXGW Neo XiHei), `serif` (Baskervville + GenRyuMin2), `mono` (Maple Mono CN), `ui` (IBM Plex Sans). CJK fonts are sliced at build time by `vite-plugin-font`.

### Agent Skill

`skill/prism-report-manager/` is an installable Claude Code skill package. It gets tarred into `public/skill.tar.gz` during prebuild and is downloadable from the deployed site. The skill contains its own copies of scripts, schema, and reference docs.

### CI/CD

- **CI** (`.github/workflows/ci.yml`) — Runs lint, format check, and build on pull requests to `main`.
- **Deploy** (`.github/workflows/deploy.yml`) — On push to `main` or manual dispatch: generates all reports, builds the site, copies Markdown into `dist/`, and deploys to Cloudflare Pages.
- Report JSON source files live in `reports/` and are committed to the repo.

### Testing

Vitest with v8 coverage (`vitest.config.js`). Tests cover schema validation, Markdown conversion, MDX conversion, and Cloudflare middleware. Fixtures in `scripts/__fixtures__/`.

## Conventions

- **Commits**: Conventional Commits enforced by commitlint. Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert. Subject max 72 chars, body max 100 chars/line.
- **Pre-commit**: Husky runs lint-staged (ESLint + Prettier on staged files).
- **Formatting**: Double quotes, semicolons, 2-space indent, trailing commas, 100 char print width.
- **Node version**: Pinned in `.node-version`.
- **Package manager**: pnpm (workspace enabled via `pnpm-workspace.yaml`).
