#!/bin/bash
set -e

# Copy AI-readable markdown files into dist/ for serving alongside HTML.
# Run after `pnpm build` so that dist/ already exists.

echo "Copying AI-readable markdown to dist..."
for md in src/content/reports/*/index.md; do
  if [ -f "$md" ]; then
    slug_dir=$(basename "$(dirname "$md")")
    mkdir -p "dist/reports/$slug_dir"
    cp "$md" "dist/reports/$slug_dir/index.md"
  fi
done
echo "Done."
