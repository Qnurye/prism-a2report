import eslintPluginAstro from "eslint-plugin-astro";
import eslintConfigPrettier from "eslint-config-prettier";
import tsParser from "@typescript-eslint/parser";

export default [
  ...eslintPluginAstro.configs.recommended,
  eslintConfigPrettier,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
    },
  },
  {
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": "warn",
    },
  },
  {
    files: ["scripts/**/*.js", "skill/**/scripts/**/*.js"],
    rules: {
      "no-console": "off",
    },
  },
  {
    files: ["**/*.test.*"],
    rules: {
      "no-console": "off",
    },
  },
  {
    ignores: ["dist/", ".astro/", "node_modules/"],
  },
];
