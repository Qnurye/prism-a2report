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

echo "Building site..."
pnpm run build

echo "Deploying to Cloudflare Pages..."
OUTPUT=$(wrangler pages deploy dist --project-name=prism-a2report 2>&1)

URL="https://prism.qnury.es/reports/$SLUG"
echo ""
echo "Deployment complete."
echo "URL: $URL"
echo "Markdown: curl $URL"
