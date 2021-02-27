// @ts-check
import { resolve } from "path";

/**
 * @type {import('vite').UserConfig}
 */
const baseConfig = {
  root: "./",
  resolve: {
    alias: {
      nm: './node_modules',
      "@": './src/components',
    },
  },
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
export default baseConfig;
