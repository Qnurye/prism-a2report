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
node scripts/json-to-markdown.js <report.json> <slug> # Generate AI-readable Markdown (standalone CLI)
./scripts/deploy-report.sh <report.json> [slug]       # Full pipeline: validate → build → deploy
./scripts/list-reports.sh                              # List deployed reports
```

## Architecture

### Report Pipeline (JSON → dual output via content loader)

Reports are authored as JSON conforming to `schema/report.schema.json`. A custom Astro content loader (`src/loaders/report-loader.ts`) reads `reports/*.json` directly — no intermediate files are generated.

1. **HTML** — The loader stores report data (title, sections, metadata) in Astro's content collection. `SectionRenderer.astro` programmatically renders sections into interactive HTML with Chart.js charts, styled tables, syntax-highlighted code (Shiki), and callout boxes.
2. **Markdown** — An Astro static endpoint (`src/pages/reports/[slug]/index.md.ts`) generates plain Markdown for AI consumption at build time, output to `dist/reports/<slug>/index.md`.

The JSON schema supports nineteen section types: `text`, `chart`, `table`, `code`, `callout`, `statcard`, `tabs`, `timeline`, `figure`, `quote`, `accordion`, `comparison`, `progress`, `metrics-grid`, `steps`, `diff`, `embed`, `gallery`, `source-list`.

### Content Collection

Astro content collection (`src/content.config.ts`) uses a custom `reportLoader` that reads `reports/*.json`, detects CJK language, and populates the store. Schema validates `title`, `author`, `date`, `lang`, `sections[]`, and `metadata`. In dev mode, the loader watches `reports/` for hot reload.

### Key Source Files

| File                                   | Purpose                                                                     |
| -------------------------------------- | --------------------------------------------------------------------------- |
| `src/loaders/report-loader.ts`         | Custom Astro content loader — reads JSON, detects CJK, populates collection |
| `src/components/SectionRenderer.astro` | Renders `sections[]` → Astro components (all 19 types)                      |
| `src/lib/extract-headings.ts`          | Extracts TOC headings from sections array                                   |
| `src/lib/slugify.ts`                   | Heading → URL-safe slug (CJK-safe, matches github-slugger)                  |
| `src/lib/cjk.ts`                       | CJK language detection (zh/ja/ko)                                           |
| `src/lib/convert-to-markdown.ts`       | Sections → plain Markdown (used by endpoint)                                |
| `src/pages/reports/[slug].astro`       | Report HTML page                                                            |
| `src/pages/reports/[slug]/index.md.ts` | Report Markdown endpoint                                                    |

### Components (src/components/)

All components are Astro components rendered by `SectionRenderer`:

- **Chart.astro** — Client-side Chart.js rendering (line/bar/pie/doughnut), dark-mode aware
- **Table.astro** — Responsive data table with Tailwind styling
- **CodeBlock.astro** — Shiki syntax highlighting with dual-theme (one-light / one-dark-pro)
- **Callout.astro** — Styled aside with info/warning/success/error variants
- **StatCard.astro** — Metric display with optional trend indicator and count-up animation
- **Figure.astro** — Image with optional caption, lazy loading
- **Quote.astro** — Styled blockquote with author/role attribution
- **Tabs.astro** — WAI-ARIA tabbed content panels (delegates to SectionRenderer for nested sections)
- **Timeline.astro** — Vertical chronological event display with staggered animations
- **Accordion.astro** — Expandable/collapsible sections, single or multi-open mode

### Styling

Tailwind CSS v4 with class-based dark mode (`.dark` class on `<html>`). Theme tokens defined as CSS custom properties in `src/styles/global.css` using OKLCH color space. Four font families: `sans` (Inter + LXGW Neo XiHei), `serif` (Baskervville + GenRyuMin2), `mono` (Maple Mono CN), `ui` (IBM Plex Sans). CJK fonts are sliced at build time by `vite-plugin-font`.

#### CJK Typography

CJK (Chinese, Japanese, Korean) typography is handled via a dedicated `@layer cjk-typography` in `global.css`. Key features:

- **Automatic language detection**: `src/lib/cjk.ts` detects CJK content (>30% CJK characters) and sets `lang` attribute via the content loader
- **Modern CSS properties**: `text-autospace`, `text-spacing-trim`, `hanging-punctuation`, `line-break: strict` with graceful degradation
- **Font features**: OpenType features (`halt`, `chws`) for punctuation spacing
- **Justification**: `text-justify: inter-character` for Chinese/Japanese, `inter-word` for Korean
- **Optimized spacing**: Increased line-height (1.9 for zh/ja, 1.8 for ko) and letter-spacing adjustments
- **Component overrides**: `whitespace-nowrap` removed from Table cells, `italic` disabled for CJK blockquotes

### Agent Skill

`skill/prism-report-manager/` is an installable Claude Code skill package. It gets tarred into `public/skill.tar.gz` during prebuild and is downloadable from the deployed site. The skill contains its own copies of scripts, schema, and reference docs.

### CI/CD

- **CI** (`.github/workflows/ci.yml`) — Runs lint, format check, and build on pull requests to `main`.
- **Deploy** (`.github/workflows/deploy.yml`) — On push to `main` or manual dispatch: builds the site (loader reads JSON, endpoint generates Markdown) and deploys to Cloudflare Pages.
- Report JSON source files live in `reports/` and are committed to the repo.

### Testing

Vitest with v8 coverage (`vitest.config.js`). Tests cover schema validation, Markdown conversion, and Cloudflare middleware. Fixtures in `scripts/__fixtures__/`.

## Conventions

- **Commits**: Conventional Commits enforced by commitlint. Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert. Subject max 72 chars, body max 100 chars/line.
- **Pre-commit**: Husky runs lint-staged (ESLint + Prettier on staged files).
- **Formatting**: Double quotes, semicolons, 2-space indent, trailing commas, 100 char print width.
- **Node version**: Pinned in `.node-version`.
- **Package manager**: pnpm (workspace enabled via `pnpm-workspace.yaml`).
