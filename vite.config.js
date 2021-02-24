// @ts-check
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { defineConfig } from "vite";

import { fixLokiRefs } from "./fixLokiRefs";

/**
 * @type {import('vite').UserConfig}
 */
const viteConfig = {
  root: "./",
  plugins:
        process.env.NODE_ENV === "development"
          ? [vue()]
          : [fixLokiRefs(), vue()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
    outDir: "dist",
    assetsDir: "./",
  },
};
export default defineConfig(viteConfig);
