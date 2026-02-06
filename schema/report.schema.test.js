import { describe, it, expect } from "vitest";
import { validateReport, loadSchema } from "../scripts/validate-report.js";

const schema = loadSchema();

function validate(report) {
  return validateReport(report, schema);
}

function validReport(overrides = {}) {
  return {
    title: "Test",
    sections: [{ type: "text", content: "Hello" }],
    ...overrides,
  };
}

describe("report-level validation", () => {
  it("requires title", () => {
    const { valid } = validate({ sections: [] });
    expect(valid).toBe(false);
  });

  it("requires sections", () => {
    const { valid } = validate({ title: "Test" });
    expect(valid).toBe(false);
  });

  it("accepts empty sections array", () => {
    const { valid } = validate({ title: "Test", sections: [] });
    expect(valid).toBe(true);
  });

  it("validates slug pattern (lowercase + hyphens)", () => {
    expect(validate(validReport({ slug: "my-report" })).valid).toBe(true);
    expect(validate(validReport({ slug: "report123" })).valid).toBe(true);
  });

  it("rejects invalid slug patterns", () => {
    expect(validate(validReport({ slug: "My Report" })).valid).toBe(false);
    expect(validate(validReport({ slug: "UPPER" })).valid).toBe(false);
    expect(validate(validReport({ slug: "has_underscore" })).valid).toBe(false);
  });

  it("validates date format (YYYY-MM-DD)", () => {
    expect(validate(validReport({ date: "2025-01-15" })).valid).toBe(true);
  });

  it("rejects invalid date formats", () => {
    expect(validate(validReport({ date: "Jan 15, 2025" })).valid).toBe(false);
    expect(validate(validReport({ date: "2025/01/15" })).valid).toBe(false);
  });

  it("accepts optional metadata with tags and category", () => {
    const report = validReport({
      metadata: { tags: ["ai", "research"], category: "analysis" },
    });
    expect(validate(report).valid).toBe(true);
  });

  it("accepts optional author field", () => {
    expect(validate(validReport({ author: "Alice" })).valid).toBe(true);
  });
});

describe("TextSection", () => {
  it("requires type and content", () => {
    const report = { title: "T", sections: [{ type: "text", content: "Hello" }] };
    expect(validate(report).valid).toBe(true);
  });

  it("rejects text section without content", () => {
    const report = { title: "T", sections: [{ type: "text" }] };
    expect(validate(report).valid).toBe(false);
  });

  it("accepts optional heading and level", () => {
    const report = {
      title: "T",
      sections: [{ type: "text", content: "Hi", heading: "Title", level: 3 }],
    };
    expect(validate(report).valid).toBe(true);
  });

  it("accepts level values 1 through 6", () => {
    for (const level of [1, 2, 3, 4, 5, 6]) {
      const report = { title: "T", sections: [{ type: "text", content: "Hi", level }] };
      expect(validate(report).valid).toBe(true);
    }
  });

  it("rejects level outside 1-6 range", () => {
    const report0 = { title: "T", sections: [{ type: "text", content: "Hi", level: 0 }] };
    expect(validate(report0).valid).toBe(false);

    const report7 = { title: "T", sections: [{ type: "text", content: "Hi", level: 7 }] };
    expect(validate(report7).valid).toBe(false);
  });
});

describe("ChartSection", () => {
  it("requires type, chartType, and data", () => {
    const report = {
      title: "T",
      sections: [{ type: "chart", chartType: "bar", data: {} }],
    };
    expect(validate(report).valid).toBe(true);
  });

  it("accepts all valid chart types", () => {
    for (const chartType of ["line", "bar", "pie", "doughnut"]) {
      const report = {
        title: "T",
        sections: [{ type: "chart", chartType, data: {} }],
      };
      expect(validate(report).valid).toBe(true);
    }
  });

  it("rejects invalid chart type", () => {
    const report = {
      title: "T",
      sections: [{ type: "chart", chartType: "radar", data: {} }],
    };
    expect(validate(report).valid).toBe(false);
  });

  it("rejects chart without data", () => {
    const report = {
      title: "T",
      sections: [{ type: "chart", chartType: "bar" }],
    };
    expect(validate(report).valid).toBe(false);
  });

  it("accepts optional title and options", () => {
    const report = {
      title: "T",
      sections: [{ type: "chart", chartType: "line", data: {}, title: "Chart Title", options: {} }],
    };
    expect(validate(report).valid).toBe(true);
  });
});

describe("TableSection", () => {
  it("requires type, headers, and rows", () => {
    const report = {
      title: "T",
      sections: [{ type: "table", headers: ["A"], rows: [["1"]] }],
    };
    expect(validate(report).valid).toBe(true);
  });

  it("rejects table without headers", () => {
    const report = {
      title: "T",
      sections: [{ type: "table", rows: [["1"]] }],
    };
    expect(validate(report).valid).toBe(false);
  });

  it("rejects table without rows", () => {
    const report = {
      title: "T",
      sections: [{ type: "table", headers: ["A"] }],
    };
    expect(validate(report).valid).toBe(false);
  });

  it("accepts optional caption", () => {
    const report = {
      title: "T",
      sections: [{ type: "table", headers: ["A"], rows: [["1"]], caption: "Table 1" }],
    };
    expect(validate(report).valid).toBe(true);
  });
});

describe("CodeSection", () => {
  it("requires type and code", () => {
    const report = {
      title: "T",
      sections: [{ type: "code", code: "print('hi')" }],
    };
    expect(validate(report).valid).toBe(true);
  });

  it("rejects code section without code", () => {
    const report = {
      title: "T",
      sections: [{ type: "code" }],
    };
    expect(validate(report).valid).toBe(false);
  });

  it("accepts optional language and filename", () => {
    const report = {
      title: "T",
      sections: [{ type: "code", code: "x = 1", language: "python", filename: "app.py" }],
    };
    expect(validate(report).valid).toBe(true);
  });
});

describe("CalloutSection", () => {
  it("requires type, variant, and content", () => {
    const report = {
      title: "T",
      sections: [{ type: "callout", variant: "info", content: "Note" }],
    };
    expect(validate(report).valid).toBe(true);
  });

  it("accepts all valid callout variants", () => {
    for (const variant of ["info", "warning", "success", "error"]) {
      const report = {
        title: "T",
        sections: [{ type: "callout", variant, content: "Test" }],
      };
      expect(validate(report).valid).toBe(true);
    }
  });

  it("rejects invalid callout variant", () => {
    const report = {
      title: "T",
      sections: [{ type: "callout", variant: "danger", content: "Test" }],
    };
    expect(validate(report).valid).toBe(false);
  });

  it("rejects callout without content", () => {
    const report = {
      title: "T",
      sections: [{ type: "callout", variant: "info" }],
    };
    expect(validate(report).valid).toBe(false);
  });

  it("rejects callout without variant", () => {
    const report = {
      title: "T",
      sections: [{ type: "callout", content: "Note" }],
    };
    expect(validate(report).valid).toBe(false);
  });

  it("accepts optional title", () => {
    const report = {
      title: "T",
      sections: [{ type: "callout", variant: "success", content: "Done", title: "Success!" }],
    };
    expect(validate(report).valid).toBe(true);
  });
});

describe("ComparisonSection", () => {
  it("requires type and items with at least 2 items", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "comparison",
          items: [
            { label: "Option A", highlights: ["Fast"] },
            { label: "Option B", highlights: ["Cheap"] },
          ],
        },
      ],
    };
    expect(validate(report).valid).toBe(true);
  });

  it("rejects fewer than 2 items", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "comparison",
          items: [{ label: "Only one", highlights: ["Alone"] }],
        },
      ],
    };
    expect(validate(report).valid).toBe(false);
  });

  it("accepts optional title, layout, and variant", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "comparison",
          title: "Compare",
          layout: "stacked",
          items: [
            { label: "A", highlights: ["Good"], variant: "positive" },
            { label: "B", highlights: ["Bad"], variant: "negative" },
          ],
        },
      ],
    };
    expect(validate(report).valid).toBe(true);
  });

  it("accepts all valid layout values", () => {
    for (const layout of ["side-by-side", "stacked"]) {
      const report = {
        title: "T",
        sections: [
          {
            type: "comparison",
            layout,
            items: [
              { label: "A", highlights: ["x"] },
              { label: "B", highlights: ["y"] },
            ],
          },
        ],
      };
      expect(validate(report).valid).toBe(true);
    }
  });

  it("rejects invalid layout value", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "comparison",
          layout: "grid",
          items: [
            { label: "A", highlights: ["x"] },
            { label: "B", highlights: ["y"] },
          ],
        },
      ],
    };
    expect(validate(report).valid).toBe(false);
  });

  it("accepts all valid variant values", () => {
    for (const variant of ["positive", "negative", "neutral"]) {
      const report = {
        title: "T",
        sections: [
          {
            type: "comparison",
            items: [
              { label: "A", highlights: ["x"], variant },
              { label: "B", highlights: ["y"] },
            ],
          },
        ],
      };
      expect(validate(report).valid).toBe(true);
    }
  });
});

describe("ProgressSection", () => {
  it("requires only type", () => {
    const report = { title: "T", sections: [{ type: "progress" }] };
    expect(validate(report).valid).toBe(true);
  });

  it("accepts bar mode with value and max", () => {
    const report = {
      title: "T",
      sections: [{ type: "progress", mode: "bar", label: "Upload", value: 75, max: 100 }],
    };
    expect(validate(report).valid).toBe(true);
  });

  it("accepts milestones mode with items", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "progress",
          mode: "milestones",
          items: [
            { label: "Start", completed: true },
            { label: "Middle", current: true },
            { label: "End" },
          ],
        },
      ],
    };
    expect(validate(report).valid).toBe(true);
  });

  it("accepts all valid mode values", () => {
    for (const mode of ["bar", "milestones"]) {
      const report = { title: "T", sections: [{ type: "progress", mode }] };
      expect(validate(report).valid).toBe(true);
    }
  });

  it("rejects invalid mode value", () => {
    const report = { title: "T", sections: [{ type: "progress", mode: "circle" }] };
    expect(validate(report).valid).toBe(false);
  });

  it("accepts all valid variant values", () => {
    for (const variant of ["default", "success", "warning", "error"]) {
      const report = { title: "T", sections: [{ type: "progress", variant }] };
      expect(validate(report).valid).toBe(true);
    }
  });
});

describe("MetricsGridSection", () => {
  it("requires type and metrics with at least 1 item", () => {
    const report = {
      title: "T",
      sections: [{ type: "metrics-grid", metrics: [{ label: "Users", value: 100 }] }],
    };
    expect(validate(report).valid).toBe(true);
  });

  it("rejects empty metrics array", () => {
    const report = {
      title: "T",
      sections: [{ type: "metrics-grid", metrics: [] }],
    };
    expect(validate(report).valid).toBe(false);
  });

  it("accepts string values", () => {
    const report = {
      title: "T",
      sections: [{ type: "metrics-grid", metrics: [{ label: "Status", value: "Active" }] }],
    };
    expect(validate(report).valid).toBe(true);
  });

  it("accepts optional columns, trend, and trendValue", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "metrics-grid",
          columns: 4,
          metrics: [{ label: "Users", value: 100, trend: "up", trendValue: "+5%" }],
        },
      ],
    };
    expect(validate(report).valid).toBe(true);
  });

  it("rejects columns outside 1-6 range", () => {
    const report0 = {
      title: "T",
      sections: [{ type: "metrics-grid", columns: 0, metrics: [{ label: "X", value: 1 }] }],
    };
    expect(validate(report0).valid).toBe(false);

    const report7 = {
      title: "T",
      sections: [{ type: "metrics-grid", columns: 7, metrics: [{ label: "X", value: 1 }] }],
    };
    expect(validate(report7).valid).toBe(false);
  });
});

describe("StepsSection", () => {
  it("requires type and steps with at least 1 item", () => {
    const report = {
      title: "T",
      sections: [{ type: "steps", steps: [{ title: "Start" }] }],
    };
    expect(validate(report).valid).toBe(true);
  });

  it("rejects empty steps array", () => {
    const report = { title: "T", sections: [{ type: "steps", steps: [] }] };
    expect(validate(report).valid).toBe(false);
  });

  it("accepts optional orientation, description, and currentStep", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "steps",
          orientation: "vertical",
          currentStep: 1,
          steps: [
            { title: "Step 1", description: "First" },
            { title: "Step 2", description: "Second" },
          ],
        },
      ],
    };
    expect(validate(report).valid).toBe(true);
  });

  it("accepts all valid orientation values", () => {
    for (const orientation of ["horizontal", "vertical"]) {
      const report = {
        title: "T",
        sections: [{ type: "steps", orientation, steps: [{ title: "Go" }] }],
      };
      expect(validate(report).valid).toBe(true);
    }
  });

  it("rejects invalid orientation value", () => {
    const report = {
      title: "T",
      sections: [{ type: "steps", orientation: "diagonal", steps: [{ title: "Go" }] }],
    };
    expect(validate(report).valid).toBe(false);
  });
});

describe("DiffSection", () => {
  it("requires type, before, and after", () => {
    const report = {
      title: "T",
      sections: [{ type: "diff", before: "old code", after: "new code" }],
    };
    expect(validate(report).valid).toBe(true);
  });

  it("rejects diff without before", () => {
    const report = {
      title: "T",
      sections: [{ type: "diff", after: "new code" }],
    };
    expect(validate(report).valid).toBe(false);
  });

  it("rejects diff without after", () => {
    const report = {
      title: "T",
      sections: [{ type: "diff", before: "old code" }],
    };
    expect(validate(report).valid).toBe(false);
  });

  it("accepts optional language and title", () => {
    const report = {
      title: "T",
      sections: [
        { type: "diff", before: "x = 1", after: "x = 2", language: "python", title: "Change" },
      ],
    };
    expect(validate(report).valid).toBe(true);
  });
});

describe("EmbedSection", () => {
  it("requires type and src", () => {
    const report = {
      title: "T",
      sections: [{ type: "embed", src: "https://example.com" }],
    };
    expect(validate(report).valid).toBe(true);
  });

  it("rejects embed without src", () => {
    const report = { title: "T", sections: [{ type: "embed" }] };
    expect(validate(report).valid).toBe(false);
  });

  it("accepts optional title, aspectRatio, and allowFullscreen", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "embed",
          src: "https://example.com",
          title: "Demo",
          aspectRatio: "4:3",
          allowFullscreen: false,
        },
      ],
    };
    expect(validate(report).valid).toBe(true);
  });
});

describe("GallerySection", () => {
  it("requires type and images with at least 1 item", () => {
    const report = {
      title: "T",
      sections: [{ type: "gallery", images: [{ src: "img.jpg", alt: "Photo" }] }],
    };
    expect(validate(report).valid).toBe(true);
  });

  it("rejects empty images array", () => {
    const report = { title: "T", sections: [{ type: "gallery", images: [] }] };
    expect(validate(report).valid).toBe(false);
  });

  it("rejects image without alt", () => {
    const report = {
      title: "T",
      sections: [{ type: "gallery", images: [{ src: "img.jpg" }] }],
    };
    expect(validate(report).valid).toBe(false);
  });

  it("accepts optional columns and caption", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "gallery",
          columns: 4,
          images: [{ src: "img.jpg", alt: "Photo", caption: "A nice photo" }],
        },
      ],
    };
    expect(validate(report).valid).toBe(true);
  });

  it("rejects columns outside 1-6 range", () => {
    const report = {
      title: "T",
      sections: [{ type: "gallery", columns: 0, images: [{ src: "a.jpg", alt: "a" }] }],
    };
    expect(validate(report).valid).toBe(false);
  });
});

describe("SourceListSection", () => {
  it("requires type and sources with at least 1 item", () => {
    const report = {
      title: "T",
      sections: [{ type: "source-list", sources: [{ id: "1", title: "Source One" }] }],
    };
    expect(validate(report).valid).toBe(true);
  });

  it("rejects empty sources array", () => {
    const report = { title: "T", sections: [{ type: "source-list", sources: [] }] };
    expect(validate(report).valid).toBe(false);
  });

  it("rejects source without id", () => {
    const report = {
      title: "T",
      sections: [{ type: "source-list", sources: [{ title: "No ID" }] }],
    };
    expect(validate(report).valid).toBe(false);
  });

  it("rejects source without title", () => {
    const report = {
      title: "T",
      sections: [{ type: "source-list", sources: [{ id: "1" }] }],
    };
    expect(validate(report).valid).toBe(false);
  });

  it("accepts optional title, url, author, and date", () => {
    const report = {
      title: "T",
      sections: [
        {
          type: "source-list",
          title: "References",
          sources: [
            {
              id: "1",
              title: "Paper",
              url: "https://example.com",
              author: "Smith",
              date: "2025",
            },
          ],
        },
      ],
    };
    expect(validate(report).valid).toBe(true);
  });
});
