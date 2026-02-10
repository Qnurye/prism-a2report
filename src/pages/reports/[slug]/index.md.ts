import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { convertToMarkdown } from "../../../lib/convert-to-markdown";

export const getStaticPaths: GetStaticPaths = async () => {
  const reports = await getCollection("reports");
  return reports.map((report) => ({
    params: { slug: report.id },
    props: { report },
  }));
};

export const GET: APIRoute = ({ props }) => {
  const { report } = props;
  const markdown = convertToMarkdown({
    title: report.data.title,
    author: report.data.author,
    date: report.data.date,
    metadata: report.data.metadata,
    sections: report.data.sections,
  });
  return new Response(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
