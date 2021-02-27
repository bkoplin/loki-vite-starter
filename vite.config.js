// @ts-check
/* eslint-disable import/no-extraneous-dependencies, no-unused-vars, import/first */
import dotEnv from "dotenv";

const env = dotEnv.config({ path: "./.env" }).parsed;
import vue from "@vitejs/plugin-vue";
import path from "path";
import ViteComponents from "vite-plugin-components";
// import { injectHtml, minifyHtml } from "vite-plugin-html";
import PurgeIcons from "vite-plugin-purge-icons";

import { fixLokiRefs } from "./fixLokiRefs";
// import packageJson from "./package.json";

const projectRootDir = path.resolve(__dirname);

const indexHTML = path.resolve(projectRootDir, "index.html");
const srcDir = path.resolve(projectRootDir, "src");
const entry = path.resolve(srcDir, "main.js");

/**
 * @type {import('vite').UserConfig['build']}
 */
const build = {
  rollupOptions: {
    input: {
      main: indexHTML,
    },
  },
  lib: {
    name: "VM",
    entry,
    formats: ["iife"],
  },
  manifest: true,
  outDir: "dist",
  assetsDir: "./",
};
const plugins = [
  fixLokiRefs(),
  vue(),
  ViteComponents({
    dirs: [
      "src",
      "node_modules/primevue",
    ],
  }),
];

/**
 * @type {import('vite').UserConfig}
 */
const baseConfig = {
  root: "./",
  base: "./",
  plugins,
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
    extensions: [
      ".mjs",
      ".js",
      ".jsx",
      ".json",
      ".sass",
      ".scss",
    ],
  },
  build,
};

/** @type{import('vite').UserConfigFn} */
export default ({ command, mode }) => {
  if (command === "serve" || mode === "development") {
    // baseConfig.base = "";
    baseConfig.server = {
      https: false,
      cors: true,
      proxy: {
        "^.*/query/.*": {
          changeOrigin: true,
          target:
                        "https://reedsmith.saplingdata.com/cobra/api/urn/com/loki/core/model/api/query/v/",
          auth: `${env.LOKI_USERNAME}:${env.LOKI_PASSWORD}`,
        },
      },
    };
  // } else {
  //   baseConfig.build.rollupOptions.output = {
  //     ...baseConfig.build.rollupOptions.output,
  //     globals: { lokiJs: "loki" },
  //   };
  //   baseConfig.build.lib = {
  //     name: "VM",
  //     entry,
  //     formats: ["iife"],
  //   };
  }
  return baseConfig;
};
