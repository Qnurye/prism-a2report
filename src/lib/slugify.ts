/**
 * Generate a URL-safe slug from heading text.
 * Matches github-slugger behavior used by rehype-slug.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\u00a0]+/g, "-")
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
