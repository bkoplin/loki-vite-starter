// @ts-check
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

import { fixLokiRefs } from "./fixLokiRefs";
import packageJson from "./package.json";

// @ts-check
/**
 * @type {import('vite').UserConfig}
 */
const baseConfig = {
  root: "./",
  base: `/urn/com/${packageJson.appInfo.loki.cloudCodeName}/${packageJson.appInfo.loki.appCodeName}/app/pages/${packageJson.appInfo.loki.pageCodeName}/`,
  resolve: {
    alias: {
      nm: "./node_modules",
      "@": "./src/components",
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
  server: {
    https: false,
    cors: true,
    proxy: {
      '/query': {
        changeOrigin: true,
        target: "https://reedsmith.saplingdata.com/cobra/api/urn/com/loki/core/model/api/query/v/",
      },
    },
    outDir: "dist",
    assetsDir: "./",
  },
};
export default ({ command, mode }) => {
  if (command === "serve" || mode === "development") {
    baseConfig.base = '/';
    return {
      // serve specific config
      ...baseConfig,
      ...{ plugins: [vue()] },
    };
  }
  // baseConfig.build.rollupOptions.output = {
  //   entryFileNames: `${packageJson.appInfo.loki.pageCodeName}![hash][name].js`,
  //   chunkFileNames: `${packageJson.appInfo.loki.pageCodeName}![hash][name].js`,
  //   assetFileNames: `${packageJson.appInfo.loki.pageCodeName}![hash][name].js`,
  // };
  return {
    // build specific config
    ...baseConfig,
    ...{
      plugins: [fixLokiRefs(), vue()],
    },
  };
};
