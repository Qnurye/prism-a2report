import eslintPluginAstro from "eslint-plugin-astro";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  ...eslintPluginAstro.configs.recommended,
  eslintConfigPrettier,
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
    ignores: ["dist/", ".astro/", "node_modules/"],
  },
];
