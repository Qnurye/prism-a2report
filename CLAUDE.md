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

# Report pipeline
node scripts/validate-report.js <report.json>        # Validate JSON against schema
node scripts/json-to-mdx.js <report.json> <slug>     # Generate MDX for Astro
node scripts/json-to-markdown.js <report.json> <slug> # Generate AI-readable Markdown
./scripts/deploy-report.sh <report.json> [slug]       # Full pipeline: validate → convert → build → deploy
./scripts/list-reports.sh                              # List deployed reports
```

## Architecture

### Report Pipeline (JSON → dual output)

Reports are authored as JSON conforming to `schema/report.schema.json`, then converted into two formats:

1. **MDX** (`src/content/reports/<slug>.mdx`) — Rendered by Astro into interactive HTML with Chart.js charts, styled tables, syntax-highlighted code (Shiki), and callout boxes
2. **Markdown** (`src/content/reports/<slug>/index.md`) — Plain Markdown for AI consumption, copied into `dist/` during build

The JSON schema supports five section types: `text`, `chart`, `table`, `code`, `callout`.

**Generated report content is gitignored** — `src/content/reports/` is in `.gitignore`. Reports are generated at build/deploy time.

### Content Collection

Astro content collection (`src/content.config.ts`) uses glob loader to find `**/*.mdx` under `src/content/reports/`. Each MDX file uses frontmatter fields: `title` (required), `author`, `date`, `layout`.

### Components (src/components/)

All components are Astro components used within MDX reports:

- **Chart.astro** — Client-side Chart.js rendering (line/bar/pie/doughnut), dark-mode aware
- **Table.astro** — Responsive data table with Tailwind styling
- **CodeBlock.astro** — Shiki syntax highlighting with dual-theme (one-light / one-dark-pro)
- **Callout.astro** — Styled aside with info/warning/success/error variants

### Styling

Tailwind CSS v4 with class-based dark mode (`.dark` class on `<html>`). Theme tokens defined as CSS custom properties in `src/styles/global.css` using OKLCH color space. Four font families: `sans` (Inter + LXGW Neo XiHei), `serif` (Baskervville + GenRyuMin2), `mono` (Maple Mono CN), `ui` (IBM Plex Sans). CJK fonts are sliced at build time by `vite-plugin-font`.

### Agent Skill

`skill/prism-report-manager/` is an installable Claude Code skill package. It gets tarred into `public/skill.tar.gz` during prebuild and is downloadable from the deployed site. The skill contains its own copies of scripts, schema, and reference docs.

## Conventions

- **Commits**: Conventional Commits enforced by commitlint. Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert. Subject max 72 chars, body max 100 chars/line.
- **Pre-commit**: Husky runs lint-staged (ESLint + Prettier on staged files).
- **Formatting**: Double quotes, semicolons, 2-space indent, trailing commas, 100 char print width.
- **Node version**: Pinned in `.node-version`.
- **Package manager**: pnpm (workspace enabled via `pnpm-workspace.yaml`).
