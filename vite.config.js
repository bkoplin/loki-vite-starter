// @ts-check
/* eslint-disable import/no-extraneous-dependencies, no-unused-vars, import/first */
import dotEnv from "dotenv";

const env = dotEnv.config({ path: "./.env" }).parsed;
import vue from "@vitejs/plugin-vue";
import path from "path";
import Components from "vite-plugin-components";

import { fixLokiRefs } from "./fixLokiRefs";

const projectRootDir = path.resolve(__dirname);

const indexHTML = path.resolve(projectRootDir, "index.html");
const srcDir = path.resolve(projectRootDir, "src");
const entry = path.resolve(srcDir, "main.js");

/**
 * @type {import('vite').UserConfig}
 */
const baseConfig = {
  root: "./",
  base: "./",
  plugins: [
    fixLokiRefs(),
    vue(),
    Components({
      dirs: [
        "src",
        "node_modules/primevue",
      ],
    }),
  ],
  resolve: {
    alias: [
      {
        find: "src",
        replacement: srcDir,
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
  build: {
    rollupOptions: {
      input: {
        main: indexHTML,
      },
    },
    // lib: {
    //   name: "VM",
    //   entry,
    //   formats: ["iife"],
    // },
    manifest: true,
    outDir: "dist",
    assetsDir: "./",
  },
  server: {
    https: false,
    cors: true,
    proxy: {
      "^.*loki.web.serviceUrlPrefix.*": {
        changeOrigin: true,
        target: `https://reedsmith.saplingdata.com/${env.LOKI_TEST_CLOUDNAME}/api/urn/com/loki/core/model/api/query/v/`,
        auth: `${env.LOKI_USERNAME}:${env.LOKI_PASSWORD}`,
      },
    },
  },
};

/** @type{import('vite').UserConfigFn} */
export default ({ command, mode }) => {
  if (command === "serve" || mode === "development") {
    return baseConfig;
  }
  return baseConfig;
};
