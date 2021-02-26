// @ts-check
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

import baseConfig from "./vite.base.config";

/**
 * @type {import('vite').UserConfig}
 */
const viteConfig = {
  ...baseConfig,
  mode: "development",
  plugins: [vue()],
};
export default defineConfig(viteConfig);
