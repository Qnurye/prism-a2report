# A2UI Report Format

The A2UI (AI-to-UI) format is a JSON structure used to define research reports. Each report contains metadata and an array of sections.

## Top-Level Fields

| Field      | Type   | Required | Description                           |
| ---------- | ------ | -------- | ------------------------------------- |
| `title`    | string | Yes      | Report title                          |
| `author`   | string | No       | Author name (default: "Prism AI")     |
| `date`     | string | No       | Publication date (YYYY-MM-DD format)  |
| `slug`     | string | No       | URL slug (lowercase, hyphens, digits) |
| `metadata` | object | No       | Tags and category                     |
| `sections` | array  | Yes      | Array of section objects              |

## Section Types

### 1. Text Section

Renders Markdown content with an optional heading.

| Field     | Type     | Required | Description                    |
| --------- | -------- | -------- | ------------------------------ |
| `type`    | `"text"` | Yes      | Section type identifier        |
| `heading` | string   | No       | Section heading text           |
| `level`   | integer  | No       | Heading level 1-6 (default: 2) |
| `content` | string   | Yes      | Markdown content               |

**Example:**

```json
{
  "type": "text",
  "heading": "Executive Summary",
  "level": 2,
  "content": "This report analyzes market trends for Q1 2026..."
}
```

### 2. Chart Section

Renders a Chart.js chart (line, bar, pie, or doughnut).

| Field       | Type      | Required | Description                                      |
| ----------- | --------- | -------- | ------------------------------------------------ |
| `type`      | `"chart"` | Yes      | Section type identifier                          |
| `chartType` | string    | Yes      | One of: `"line"`, `"bar"`, `"pie"`, `"doughnut"` |
| `title`     | string    | No       | Chart title                                      |
| `data`      | object    | Yes      | Chart.js data object (labels + datasets)         |
| `options`   | object    | No       | Chart.js options object                          |

**Example:**

```json
{
  "type": "chart",
  "chartType": "bar",
  "title": "Monthly Revenue",
  "data": {
    "labels": ["Jan", "Feb", "Mar"],
    "datasets": [
      {
        "label": "Revenue ($M)",
        "data": [100, 150, 200]
      }
    ]
  }
}
```

### 3. Table Section

Renders a data table with headers and rows.

| Field     | Type       | Required | Description                   |
| --------- | ---------- | -------- | ----------------------------- |
| `type`    | `"table"`  | Yes      | Section type identifier       |
| `caption` | string     | No       | Table caption                 |
| `headers` | string[]   | Yes      | Column header labels          |
| `rows`    | string[][] | Yes      | Array of row arrays (strings) |

**Example:**

```json
{
  "type": "table",
  "caption": "Regional Breakdown",
  "headers": ["Region", "Revenue", "Growth"],
  "rows": [
    ["North America", "$80M", "+15%"],
    ["Europe", "$60M", "+10%"],
    ["Asia Pacific", "$60M", "+25%"]
  ]
}
```

### 4. Code Section

Renders a syntax-highlighted code block.

| Field      | Type     | Required | Description                   |
| ---------- | -------- | -------- | ----------------------------- |
| `type`     | `"code"` | Yes      | Section type identifier       |
| `language` | string   | No       | Language for syntax highlight |
| `filename` | string   | No       | Optional filename label       |
| `code`     | string   | Yes      | Code content                  |

**Example:**

```json
{
  "type": "code",
  "language": "python",
  "filename": "analysis.py",
  "code": "import pandas as pd\n\ndf = pd.read_csv('data.csv')\nprint(df.describe())"
}
```

### 5. Callout Section

Renders an info/warning/success/error callout box.

| Field     | Type        | Required | Description                                           |
| --------- | ----------- | -------- | ----------------------------------------------------- |
| `type`    | `"callout"` | Yes      | Section type identifier                               |
| `variant` | string      | Yes      | One of: `"info"`, `"warning"`, `"success"`, `"error"` |
| `title`   | string      | No       | Callout title                                         |
| `content` | string      | Yes      | Callout body text                                     |

**Example:**

```json
{
  "type": "callout",
  "variant": "warning",
  "title": "Data Limitation",
  "content": "Q1 data for Asia Pacific is preliminary and subject to revision."
}
```

### 6. StatCard Section

Renders a key metric card with optional trend indicator and count-up animation.

| Field         | Type             | Required | Description                              |
| ------------- | ---------------- | -------- | ---------------------------------------- |
| `type`        | `"statcard"`     | Yes      | Section type identifier                  |
| `label`       | string           | Yes      | Metric label                             |
| `value`       | string \| number | Yes      | Metric value (numbers get count-up anim) |
| `description` | string           | No       | Additional context                       |
| `trend`       | string           | No       | One of: `"up"`, `"down"`, `"neutral"`    |
| `trendValue`  | string           | No       | Trend display value (e.g. "+15%")        |

**Example:**

```json
{
  "type": "statcard",
  "label": "Monthly Active Users",
  "value": 12500,
  "trend": "up",
  "trendValue": "+15%",
  "description": "Compared to previous month"
}
```

### 7. Tabs Section

Renders tabbed content panels for organizing related content.

| Field            | Type     | Required | Description                     |
| ---------------- | -------- | -------- | ------------------------------- |
| `type`           | `"tabs"` | Yes      | Section type identifier         |
| `tabs`           | array    | Yes      | Array of tab objects (min 2)    |
| `tabs[].label`   | string   | Yes      | Tab button label                |
| `tabs[].content` | string   | Yes      | Tab panel content               |
| `defaultTab`     | integer  | No       | Zero-based index of default tab |

**Example:**

```json
{
  "type": "tabs",
  "tabs": [
    { "label": "Overview", "content": "General project overview..." },
    { "label": "Technical", "content": "Technical implementation details..." },
    { "label": "Timeline", "content": "Project milestones and deadlines..." }
  ],
  "defaultTab": 0
}
```

### 8. Timeline Section

Renders a vertical timeline of chronological events with staggered animations.

| Field                  | Type         | Required | Description             |
| ---------------------- | ------------ | -------- | ----------------------- |
| `type`                 | `"timeline"` | Yes      | Section type identifier |
| `events`               | array        | Yes      | Array of events (min 1) |
| `events[].date`        | string       | Yes      | Event date              |
| `events[].title`       | string       | Yes      | Event title             |
| `events[].description` | string       | No       | Event description       |

**Example:**

```json
{
  "type": "timeline",
  "events": [
    {
      "date": "2026-01-15",
      "title": "Project Kickoff",
      "description": "Initial planning and team formation"
    },
    {
      "date": "2026-02-01",
      "title": "Alpha Release",
      "description": "First internal testing build"
    },
    { "date": "2026-03-10", "title": "Public Beta" }
  ]
}
```

### 9. Figure Section

Renders an image with caption and lazy loading.

| Field     | Type       | Required | Description                      |
| --------- | ---------- | -------- | -------------------------------- |
| `type`    | `"figure"` | Yes      | Section type identifier          |
| `src`     | string     | Yes      | Image URL                        |
| `alt`     | string     | Yes      | Alt text for accessibility       |
| `caption` | string     | No       | Image caption                    |
| `width`   | string     | No       | CSS width value (default "100%") |

**Example:**

```json
{
  "type": "figure",
  "src": "https://example.com/chart.png",
  "alt": "Market share distribution chart",
  "caption": "Figure 1: Market share by region, Q1 2026",
  "width": "80%"
}
```

### 10. Quote Section

Renders a styled blockquote with attribution, distinct from prose blockquotes.

| Field    | Type      | Required | Description             |
| -------- | --------- | -------- | ----------------------- |
| `type`   | `"quote"` | Yes      | Section type identifier |
| `text`   | string    | Yes      | Quote text              |
| `author` | string    | Yes      | Quote author            |
| `role`   | string    | No       | Author's role or title  |

**Example:**

```json
{
  "type": "quote",
  "text": "The best way to predict the future is to invent it.",
  "author": "Alan Kay",
  "role": "Computer Scientist"
}
```

### 11. Accordion Section

Renders expandable/collapsible content sections with smooth animations.

| Field             | Type          | Required | Description                               |
| ----------------- | ------------- | -------- | ----------------------------------------- |
| `type`            | `"accordion"` | Yes      | Section type identifier                   |
| `items`           | array         | Yes      | Array of accordion items (min 1)          |
| `items[].title`   | string        | Yes      | Item header text                          |
| `items[].content` | string        | Yes      | Item body text                            |
| `allowMultiple`   | boolean       | No       | Allow multiple items open (default false) |

**Example:**

```json
{
  "type": "accordion",
  "items": [
    {
      "title": "What is A2UI?",
      "content": "A2UI is a JSON format for defining research reports..."
    },
    {
      "title": "How are reports rendered?",
      "content": "Reports are converted to MDX for interactive HTML..."
    }
  ],
  "allowMultiple": false
}
```
