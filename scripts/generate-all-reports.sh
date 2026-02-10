#!/bin/bash
set -e

# Generate MDX + Markdown for all report JSONs in reports/
# Usage: ./scripts/generate-all-reports.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPORTS_DIR="$SCRIPT_DIR/../reports"

shopt -s nullglob
json_files=("$REPORTS_DIR"/*.json)
shopt -u nullglob

if [ ${#json_files[@]} -eq 0 ]; then
  echo "Compiled 0 report JSON files."
  exit 0
fi

compiled_count=0

for json_file in "${json_files[@]}"; do
  slug="$(basename "$json_file" .json)"
  node scripts/validate-report.js "$json_file" >/dev/null
  node scripts/json-to-mdx.js "$json_file" "$slug" >/dev/null
  node scripts/json-to-markdown.js "$json_file" "$slug" >/dev/null
  compiled_count=$((compiled_count + 1))
done

echo "Compiled ${compiled_count} report JSON files."
