#!/bin/bash
set -e

# Usage: ./scripts/deploy-report.sh <report.json> [slug]
REPORT_JSON="$1"
SLUG="${2:-"report-$(date +%Y%m%d-%H%M%S)"}"

if [ ! -f "$REPORT_JSON" ]; then
  echo "Error: File not found: $REPORT_JSON" >&2
  exit 1
fi

echo "Validating report..."
node scripts/validate-report.js "$REPORT_JSON"

echo "Generating MDX..."
node scripts/json-to-mdx.js "$REPORT_JSON" "$SLUG"

echo "Generating Markdown (AI-readable)..."
node scripts/json-to-markdown.js "$REPORT_JSON" "$SLUG"

echo "Packing skill tarball..."
tar -czf public/skill.tar.gz -C skill/ prism-report-manager/

echo "Building site..."
pnpm run build

echo "Copying AI-readable markdown to dist..."
for md in src/content/reports/*/index.md; do
  if [ -f "$md" ]; then
    slug_dir=$(basename "$(dirname "$md")")
    mkdir -p "dist/reports/$slug_dir"
    cp "$md" "dist/reports/$slug_dir/index.md"
  fi
done

echo "Deploying to Cloudflare Pages..."
OUTPUT=$(wrangler pages deploy dist --project-name=prism-a2report 2>&1)

URL="https://prism.qnury.es/reports/$SLUG"
echo ""
echo "Deployment complete."
echo "URL: $URL"
echo "Markdown: curl $URL"
