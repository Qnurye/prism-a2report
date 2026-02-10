import { defineCollection, z } from "astro:content";
import { reportLoader } from "./loaders/report-loader";

const reports = defineCollection({
  loader: reportLoader({ reportsDir: "./reports" }),
  schema: z.object({
    title: z.string(),
    author: z.string().optional(),
    date: z.string().optional(),
    lang: z.string().optional(),
    sections: z.array(z.object({ type: z.string() }).passthrough()),
    metadata: z
      .object({
        tags: z.array(z.string()).optional(),
        category: z.string().optional(),
      })
      .optional(),
  }),
});

export const collections = { reports };
