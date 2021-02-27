import url from "@rollup/plugin-url";
import vue from "@vitejs/plugin-vue";
import path from "path";

import { fixLokiRefs } from "./fixLokiRefs";
import packageJson from "./package.json";

// @ts-check
/* eslint-disable import/no-extraneous-dependencies */
const projectRootDir = path.resolve(__dirname);

const indexHTML = path.resolve(projectRootDir, "index.html");
const srcDir = path.resolve(projectRootDir, "src");
let buildOptions = {
  rollupOptions: {
    input: {
      main: indexHTML,
    },
  },
  outDir: "dist",
  assetsDir: "./",
};
// @ts-check
/**
 * @type {import('vite').UserConfig}
 */
const baseConfig = {
  root: "./",
  base: './',
  resolve: {
    alias: [
      {
        find: "src",
        replacement: srcDir,
        // OR place `customResolver` here. See explanation below.
      },
      {
        find: "deps",
        replacement: path.resolve(projectRootDir, "node_modules"),
      },
      {
        find: "@",
        replacement: path.resolve(srcDir, "components"),
      },
    ],
    extensions: [".mjs", ".js", ".jsx", ".json", ".sass", ".scss"],
  },
  build: buildOptions,
};

/** @type{import('vite').UserConfigFn} */
export default ({ command, mode }) => {
  if (command === "serve" || mode === "development") {
    // baseConfig.base = "";
    return {
      // serve specific config
      ...baseConfig,
      ...{ plugins: [vue()] },
      server: {
        https: false,
        cors: true,
        proxy: {
          "/query": {
            changeOrigin: true,
            target: "https://reedsmith.saplingdata.com/cobra/api/urn/com/loki/core/model/api/query/v/",
            // eslint-disable-next-line spaced-comment
            //*! HOW DO I USE AUTH?
            // auth: 
          },
        },
      },
    };
  }
  buildOptions = {
    ...buildOptions,
    ...{
      lib: {
        entry: path.resolve(srcDir, 'main.js'),
        name: 'vm',
      },
    },
  };
  // buildOptions.rollupOptions.output = {
  //   entryFileNames: `${packageJson.appInfo.loki.pageCodeName}![hash].[name].js`,
  //   chunkFileNames: `${packageJson.appInfo.loki.pageCodeName}![hash].[name].js`,
  //   assetFileNames: `${packageJson.appInfo.loki.pageCodeName}![hash].[name][extname]`,
  // };
  // baseConfig.build = buildOptions;
  return {
    // build specific config
    ...baseConfig,
    // assetsInclude: [".svg", ".woff", ".eot", ".ttf"],
    ...{
      plugins: [
        fixLokiRefs(),
        // url({
        //   fileName: `${packageJson.appInfo.loki.pageCodeName}![hash].[name][extname]`,
        //   include: [
        //     "**/*.ico",
        //     "**/*.svg",
        //     "**/*.woff",
        //     "**/*.eot",
        //     "**/*.ttf",
        //   ],
        // }),
        vue(),
      ],
    },
  };
};
