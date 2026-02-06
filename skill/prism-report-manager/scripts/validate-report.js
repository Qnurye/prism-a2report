#!/usr/bin/env node
// Wrapper: delegates to the real validate script in the project
const { execFileSync } = require("child_process");
const path = require("path");
const real = path.join(process.env.HOME, "Projects/prism-a2report/scripts/validate-report.js");
try {
  execFileSync("node", [real, ...process.argv.slice(2)], { stdio: "inherit" });
} catch {
  process.exit(1);
}
