import type { Loader } from "astro/loaders";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, basename } from "node:path";
import { detectCJKLang } from "../lib/cjk";

interface ReportLoaderOptions {
  reportsDir: string;
}

export function reportLoader({ reportsDir }: ReportLoaderOptions): Loader {
  return {
    name: "report-loader",
    load: async ({ store, logger, parseData, generateDigest, watcher }) => {
      const dir = resolve(reportsDir);

      async function loadReport(filePath: string) {
        const raw = readFileSync(filePath, "utf-8");
        const report = JSON.parse(raw);
        const slug = report.slug || basename(filePath, ".json");

        const contentSample =
          report.title +
          report.sections
            .map((s: Record<string, unknown>) => s.content || s.text || "")
            .join("")
            .slice(0, 2000);
        const lang = detectCJKLang(contentSample) || undefined;

        const data = await parseData({
          id: slug,
          data: {
            title: report.title,
            author: report.author,
            date: report.date,
            lang,
            sections: report.sections,
            metadata: report.metadata,
          },
        });

        store.set({
          id: slug,
          data,
          digest: generateDigest(data),
        });
      }

      store.clear();
      const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
      for (const file of files) {
        await loadReport(resolve(dir, file));
      }

      if (watcher) {
        const handleFileChange = async (changedPath: string) => {
          if (typeof changedPath !== "string") return;
          if (!changedPath.endsWith(".json")) return;
          if (!changedPath.startsWith(dir)) return;
          logger.info(`Report changed: ${basename(changedPath)}`);
          await loadReport(changedPath);
        };

        watcher.on("change", handleFileChange);
        watcher.on("add", handleFileChange);
        watcher.add(dir);
      }
    },
  };
}
