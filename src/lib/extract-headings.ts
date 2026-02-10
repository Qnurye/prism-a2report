import { slugify } from "./slugify";

interface Section {
  type: string;
  heading?: string;
  level?: number;
  tabs?: Array<{ label: string; sections: Section[] }>;
  [key: string]: unknown;
}

export interface TocHeading {
  depth: number;
  slug: string;
  text: string;
}

export function extractHeadings(sections: Section[]): TocHeading[] {
  const headings: TocHeading[] = [];
  const slugCounts = new Map<string, number>();

  function addHeading(text: string, depth: number) {
    const baseSlug = slugify(text);
    const count = slugCounts.get(baseSlug) || 0;
    const slug = count === 0 ? baseSlug : `${baseSlug}-${count}`;
    slugCounts.set(baseSlug, count + 1);
    headings.push({ depth, slug, text });
  }

  function processSection(section: Section) {
    if (section.type === "text" && section.heading) {
      addHeading(section.heading, section.level || 2);
    }
    if (section.type === "tabs" && section.tabs) {
      for (const tab of section.tabs) {
        for (const s of tab.sections) {
          processSection(s);
        }
      }
    }
  }

  for (const section of sections) {
    processSection(section);
  }

  return headings;
}
