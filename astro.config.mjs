// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import Font from "vite-plugin-font";

// https://astro.build/config
export default defineConfig({
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
