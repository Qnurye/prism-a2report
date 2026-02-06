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
  echo "No report JSON files found in reports/. Skipping."
  exit 0
fi

for json_file in "${json_files[@]}"; do
  slug="$(basename "$json_file" .json)"
  echo "Processing $slug..."

  echo "  Validating..."
  node scripts/validate-report.js "$json_file"

  echo "  Generating MDX..."
  node scripts/json-to-mdx.js "$json_file" "$slug"

  echo "  Generating Markdown..."
  node scripts/json-to-markdown.js "$json_file" "$slug"
done

echo "All reports generated."
