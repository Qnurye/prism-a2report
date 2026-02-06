import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const reports = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/reports" }),
  schema: z.object({
    title: z.string(),
    author: z.string().optional(),
    date: z.string().optional(),
    layout: z.string().optional(),
  }),
});

export const collections = { reports };
