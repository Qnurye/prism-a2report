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
