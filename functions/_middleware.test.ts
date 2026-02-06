import { describe, it, expect, vi } from "vitest";
import { onRequest } from "./_middleware.js";

function createContext({
  url = "https://prism.qnury.es/reports/test/",
  accept = "text/html",
  userAgent = "Mozilla/5.0",
  assetResponse = new Response("# Markdown", { status: 200 }),
  nextResponse = new Response("<html>page</html>", { status: 200 }),
}: {
  url?: string;
  accept?: string;
  userAgent?: string;
  assetResponse?: Response;
  nextResponse?: Response;
} = {}) {
  return {
    request: new Request(url, {
      headers: {
        accept,
        "user-agent": userAgent,
      },
    }),
    next: vi.fn().mockResolvedValue(nextResponse),
    env: {
      ASSETS: {
        fetch: vi.fn().mockResolvedValue(assetResponse),
      },
    },
  };
}

describe("_middleware onRequest", () => {
  describe("non-report paths", () => {
    it("passes through for root path", async () => {
      const ctx = createContext({ url: "https://prism.qnury.es/" });
      await onRequest(ctx);
      expect(ctx.next).toHaveBeenCalled();
      expect(ctx.env.ASSETS.fetch).not.toHaveBeenCalled();
    });

    it("passes through for non-report paths", async () => {
      const ctx = createContext({ url: "https://prism.qnury.es/about" });
      await onRequest(ctx);
      expect(ctx.next).toHaveBeenCalled();
    });
  });

  describe("browser requests", () => {
    it("passes through for normal browser Accept header", async () => {
      const ctx = createContext({ accept: "text/html,application/xhtml+xml" });
      await onRequest(ctx);
      expect(ctx.next).toHaveBeenCalled();
      expect(ctx.env.ASSETS.fetch).not.toHaveBeenCalled();
    });
  });

  describe("markdown via Accept header", () => {
    it("returns markdown for text/markdown Accept", async () => {
      const ctx = createContext({ accept: "text/markdown" });
      const resp = await onRequest(ctx);
      expect(resp.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
      expect(resp.headers.get("X-Content-Format")).toBe("markdown");
    });

    it("returns markdown for text/plain Accept", async () => {
      const ctx = createContext({ accept: "text/plain" });
      const resp = await onRequest(ctx);
      expect(resp.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    });
  });

  describe("markdown via user-agent detection", () => {
    const agents = [
      "curl/8.0",
      "Wget/1.21",
      "HTTPie/3.2",
      "anthropic-ai/1.0",
      "OpenAI/1.0",
      "ClaudeBot/1.0",
      "GPTBot/1.0",
    ];

    for (const ua of agents) {
      it(`returns markdown for ${ua.split("/")[0]}`, async () => {
        const ctx = createContext({ userAgent: ua, accept: "*/*" });
        const resp = await onRequest(ctx);
        expect(resp.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
      });
    }
  });

  describe("path normalization", () => {
    it("appends /index.md to path with trailing slash", async () => {
      const ctx = createContext({ accept: "text/markdown" });
      await onRequest(ctx);
      const fetchCall = ctx.env.ASSETS.fetch.mock.calls[0][0];
      expect(fetchCall.pathname).toBe("/reports/test/index.md");
    });

    it("appends /index.md to path without trailing slash", async () => {
      const ctx = createContext({
        url: "https://prism.qnury.es/reports/test",
        accept: "text/markdown",
      });
      await onRequest(ctx);
      const fetchCall = ctx.env.ASSETS.fetch.mock.calls[0][0];
      expect(fetchCall.pathname).toBe("/reports/test/index.md");
    });
  });

  describe("404 fallback", () => {
    it("falls through to next() when markdown asset is not found", async () => {
      const ctx = createContext({
        accept: "text/markdown",
        assetResponse: new Response("Not Found", { status: 404 }),
      });
      await onRequest(ctx);
      expect(ctx.next).toHaveBeenCalled();
    });
  });

  describe("response body", () => {
    it("returns the markdown body from the asset", async () => {
      const mdContent = "# Test Report\n\nHello world";
      const ctx = createContext({
        accept: "text/markdown",
        assetResponse: new Response(mdContent, { status: 200 }),
      });
      const resp = await onRequest(ctx);
      const body = await resp.text();
      expect(body).toBe(mdContent);
    });
  });
});
