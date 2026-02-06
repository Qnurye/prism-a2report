// functions/_middleware.ts
export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  // Only apply to report pages
  if (!url.pathname.startsWith("/reports/")) {
    return next();
  }

  const accept = request.headers.get("accept") || "";
  const ua = (request.headers.get("user-agent") || "").toLowerCase();

  const wantsMarkdown =
    accept.includes("text/markdown") ||
    accept.includes("text/plain") ||
    ua.includes("curl") ||
    ua.includes("wget") ||
    ua.includes("httpie") ||
    ua.includes("anthropic") ||
    ua.includes("openai") ||
    ua.includes("claudebot") ||
    ua.includes("gptbot");

  if (wantsMarkdown) {
    const mdPath = url.pathname.replace(/\/?$/, "/index.md");
    const mdResponse = await env.ASSETS.fetch(new URL(mdPath, url.origin));

    if (mdResponse.ok) {
      return new Response(mdResponse.body, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "X-Content-Format": "markdown",
        },
      });
    }
  }

  return next();
}
