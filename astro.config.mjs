// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import Font from "vite-plugin-font";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  vite: {
    plugins: [
      tailwindcss(),
      Font.vite({
        scanFiles: ["src/**/*.{astro,ts,tsx,js,jsx,mdx}"],
        cacheDir: "node_modules/.cache/.font",
      }),
    ],
  },
});
