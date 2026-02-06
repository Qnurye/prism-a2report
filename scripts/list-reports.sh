#!/bin/bash
# Lists all deployed report MDX files in the content directory
ls -1 src/content/reports/*.mdx 2>/dev/null | while read -r file; do
  slug=$(basename "$file" .mdx)
  title=$(head -5 "$file" | grep "^title:" | sed 's/title: *"\(.*\)"/\1/')
  date=$(head -5 "$file" | grep "^date:" | sed 's/date: *"\(.*\)"/\1/')
  echo "$date  $slug  $title"
done | sort -r
