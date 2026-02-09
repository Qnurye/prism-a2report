import Ajv from "ajv";
import addFormats from "ajv-formats";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function loadSchema() {
  return JSON.parse(readFileSync(resolve(__dirname, "../schema/report.schema.json"), "utf-8"));
}

export function validateReport(report, schema) {
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const valid = validate(report);
  return { valid, errors: validate.errors || [] };
}

export function checkMdxContent(report) {
  const warnings = [];
  const MDX_SPECIAL = /[{}]|<(?![a-zA-Z/])/;

  report.sections.forEach((section, index) => {
    if (section.type === "text" || section.type === "callout") {
      for (const field of ["content", "heading"]) {
        const value = section[field];
        if (typeof value !== "string") continue;
        const match = value.match(MDX_SPECIAL);
        if (match) {
          warnings.push({
            sectionIndex: index,
            field,
            match: match[0],
            message: `Section ${index} field "${field}" contains MDX-special character "${match[0]}" — will be auto-escaped during MDX conversion`,
          });
        }
      }
    }
  });

  return warnings;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error("Usage: node scripts/validate-report.js <report.json>");
    process.exit(1);
  }

  const schema = loadSchema();
  const report = JSON.parse(readFileSync(resolve(jsonPath), "utf-8"));
  const { valid, errors } = validateReport(report, schema);

  if (valid) {
    console.log("Valid report.");
    const mdxWarnings = checkMdxContent(report);
    if (mdxWarnings.length > 0) {
      console.log("\nMDX content warnings:");
      for (const w of mdxWarnings) {
        console.log(`  ${w.message}`);
      }
    }
    process.exit(0);
  } else {
    console.error("Validation errors:");
    for (const err of errors) {
      console.error(`  ${err.instancePath} ${err.message}`);
    }
    process.exit(1);
  }
}
