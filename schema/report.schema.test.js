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
