import Ajv from "ajv";
import addFormats from "ajv-formats";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error("Usage: node scripts/validate-report.js <report.json>");
  process.exit(1);
}

const schema = JSON.parse(
  readFileSync(resolve(__dirname, "../schema/report.schema.json"), "utf-8"),
);
const report = JSON.parse(readFileSync(resolve(jsonPath), "utf-8"));

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);
const valid = validate(report);

if (valid) {
  console.log("Valid report.");
  process.exit(0);
} else {
  console.error("Validation errors:");
  for (const err of validate.errors) {
    console.error(`  ${err.instancePath} ${err.message}`);
  }
  process.exit(1);
}
