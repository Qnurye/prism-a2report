# Prism A2Report - Design System

**Version:** 2.1
**Date:** 2026-02-06

The design system is derived from `qnury.es` to maintain visual consistency across all properties.

---

## 1. Typography

### 1.1 Font Stack

| Role     | Latin           | CJK                      | Fallback     | Notes                                      |
| -------- | --------------- | ------------------------- | ------------ | ------------------------------------------ |
| Body     | Inter           | LXGW Neo XiHei            | `sans-serif` | Article prose                              |
| Headings | Baskervville    | GenRyuMin2 TC, Songti SC  | `serif`      | Report section headings                    |
| Code     | Maple Mono      | Maple Mono CN             | `monospace`  | Code blocks, inline code                   |
| UI       | IBM Plex Sans   | —                         | `sans-serif` | Navigation, buttons, labels (English-only) |

### 1.2 CSS Custom Properties

```css
@theme inline {
  --font-sans: "Inter", "LXGW Neo XiHei", sans-serif;
  --font-serif: "Baskervville", "GenRyuMin2 TC", "Songti SC", serif;
  --font-mono: "Maple Mono CN", "Maple Mono", monospace;
  --font-ui: "IBM Plex Sans", sans-serif;
}
```

### 1.3 Font Loading Strategy

**Latin fonts** are loaded from Google Fonts via `<link>` tags with `display=swap`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Baskervville:ital@0;1&display=swap"
  rel="stylesheet"
/>
```

**Maple Mono** (Latin subset) is loaded via `@font-face` from jsDelivr CDN:

```css
@font-face {
  font-family: "Maple Mono";
  font-style: normal;
  font-display: swap;
  font-weight: 400;
  src:
    url(https://cdn.jsdelivr.net/fontsource/fonts/maple-mono@latest/latin-400-normal.woff2)
      format("woff2"),
    url(https://cdn.jsdelivr.net/fontsource/fonts/maple-mono@latest/latin-400-normal.woff)
      format("woff");
}
```

**Maple Mono CN** is loaded from `chinese-fonts-cdn.deno.dev` (a public CDN serving pre-sliced Chinese fonts):

```html
<link
  rel="stylesheet"
  href="https://chinese-fonts-cdn.deno.dev/packages/maple-mono-cn/dist/MapleMono-CN-Regular/result.css"
/>
```

**CJK body/heading fonts** (LXGW Neo XiHei, GenRyuMin2 TC) use build-time slicing via `vite-plugin-font`. See [tech-details.md](tech-details.md#cjk-font-optimization) for the full technical explanation.

### 1.4 Report Typography

```css
body {
  @apply bg-background text-foreground font-sans antialiased;
}

.prose h1 { @apply font-black text-4xl font-serif mt-8; }
.prose h2 { @apply font-semibold text-3xl font-serif mt-4; }
.prose h3 { @apply font-medium text-2xl font-serif mt-3; }
.prose h4 { @apply font-bold text-xl font-serif; }
.prose p  { @apply leading-relaxed text-pretty; }

.prose blockquote {
  @apply border-l-4 border-gray-500 pl-4 italic text-gray-600 dark:text-gray-400 my-2;
}

code {
  @apply bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono;
}

.prose pre {
  @apply p-4 rounded-lg overflow-x-auto;
}
```

---

## 2. Color System

Uses OKLCH color space for perceptually uniform color representation. Both light and dark themes are defined via CSS custom properties.

### 2.1 Light Theme

```css
:root {
  --background: oklch(1 0 0);              /* Pure white */
  --foreground: oklch(0.145 0 0);          /* Near black */
  --primary: oklch(0.65 0.08 250);         /* Muted blue */
  --primary-foreground: oklch(0.98 0.01 250);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.92 0.03 250);
  --accent-foreground: oklch(0.25 0.04 250);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.65 0.08 250);
  --destructive: oklch(0.577 0.245 27.325);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
}
```

### 2.2 Dark Theme

```css
.dark {
  --background: oklch(0.145 0 0);          /* Near black */
  --foreground: oklch(0.985 0 0);          /* Near white */
  --primary: oklch(0.75 0.1 250);          /* Brighter blue */
  --primary-foreground: oklch(0.15 0.02 250);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.3 0.04 250);
  --accent-foreground: oklch(0.9 0.03 250);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.65 0.08 250);
  --destructive: oklch(0.704 0.191 22.216);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
}
```

### 2.3 Dark Mode Behavior

Dark mode is toggled via the `.dark` class on `<html>`:

- **Default**: Respects `prefers-color-scheme` media query
- **Persistence**: User choice is saved to `localStorage`
- **Toggle**: CSS custom variant `@custom-variant dark (&:is(.dark *))`

---

## 3. Responsive Layout

Reports must be comfortable to read on mobile devices. Layout uses a max-width container with responsive padding:

```css
.report-container {
  @apply max-w-4xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24 min-h-screen;
}
```

### 3.1 Mobile-Specific Adaptations

| Element       | Behavior                                               |
| ------------- | ------------------------------------------------------ |
| Tables        | Wrapped in `overflow-x-auto` for horizontal scrolling  |
| Charts        | Resize to container width via Chart.js responsive mode |
| Code blocks   | `overflow-x-auto` with horizontal scrolling            |
| Images        | `max-w-full` with `height: auto`                       |
| Font sizes    | Base `text-base` (16px); headings scale proportionally |
| Touch targets | Minimum 44px for interactive elements                  |

### 3.2 Breakpoints

Standard Tailwind CSS v4 breakpoints:

| Prefix | Min width | Typical device  |
| ------ | --------- | --------------- |
| `sm`   | 640px     | Large phone     |
| `md`   | 768px     | Tablet          |
| `lg`   | 1024px    | Desktop         |
| `xl`   | 1280px    | Large desktop   |
