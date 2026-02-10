import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["scripts/**/*.js", "functions/**/*.ts", "src/lib/**/*.ts", "src/loaders/**/*.ts"],
      exclude: ["**/*.test.*", "**/__fixtures__/**"],
    },
  },
});
