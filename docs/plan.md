# Prism A2Report - Implementation Plan

**Version:** 2.1
**Date:** 2026-02-06

---

## Phase 1: Project Foundation

**Goal**: Astro project that renders a hardcoded report with full styling.

- [ ] Initialize Astro project with Tailwind CSS v4
- [ ] Set up font loading (Google Fonts, jsDelivr, chinese-fonts-cdn)
- [ ] Configure `vite-plugin-font` for CJK font build-time slicing
- [ ] Implement `ReportLayout.astro` with design system tokens
- [ ] Build components: `Table.astro`, `Callout.astro`, `Chart.astro`, `CodeBlock.astro`
- [ ] Implement dark mode toggle (respects system preference)
- [ ] Verify responsive layout on mobile viewports

---

## Phase 2: Content Pipeline

**Goal**: End-to-end pipeline from JSON to deployed report with dual output.

- [ ] Define `report.schema.json` (A2UI format)
- [ ] Implement `validate-report.js`
- [ ] Implement `json-to-mdx.js` (JSON → MDX with component imports)
- [ ] Implement `json-to-markdown.js` (JSON → pure Markdown for AI)
- [ ] Write `deploy-report.sh` (full pipeline)
- [ ] Write `list-reports.sh`

---

## Phase 3: AI Integration

**Goal**: AI agents can discover, download skill, deploy reports, and read them.

- [ ] Create `functions/_middleware.ts` (content negotiation)
- [ ] Write `llms.txt`
- [ ] Write `SKILL.md` and skill package contents
- [ ] Implement skill tarball generation in build pipeline
- [ ] Create `/skill` plaintext guide
- [ ] Test content negotiation with `curl`, `wget`, and explicit `Accept` headers

---

## Phase 4: Testing & Polish

**Goal**: Production-ready v1.0.

- [ ] Test full deployment cycle
- [ ] Validate mobile responsiveness across devices
- [ ] Test dark/light mode switching
- [ ] Test content negotiation edge cases
- [ ] Verify CJK font loading performance
- [ ] Create sample reports for visual QA
