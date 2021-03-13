// @ts-check
/* eslint-disable no-unused-vars, no-process-env */

import dotEnv from "dotenv";

dotEnv.config();
dotEnv.config({path: `./.env.${process.env.NODE_ENV}`});

import components from "vite-plugin-components";
import path from "path";
import vue from "@vitejs/plugin-vue";

import {fixLokiRefs} from "./fixLokiRefs";

const projectRootDir = path.resolve(__dirname);
const indexHTML = path.resolve(
    projectRootDir,
    "index.html"
);
const srcDir = path.resolve(
    projectRootDir,
    "src"
);
const localLoki = path.resolve(
    __dirname,
    "src/loki/index.js"
);
const pageUrn = `urn:com:${process.env.VITE_CLOUD_CODE_NAME}:${process.env.VITE_APP_CODE_NAME}:app:pages:${process.env.VITE_PAGE_CODE_NAME}`;
// const { process.env.VITE_APP_CODE_NAME } = dev;
/**
 * @type {import('vite').UserConfig}
 */
const baseConfig = {
    base: "./",
    build: {
        rollupOptions: {
            external: [localLoki], // see https://rollupjs.org/guide/en/#external
            output: {
                format: "iife",
                name: process.env.VITE_PAGE_CODE_NAME,
                globals: {[localLoki]: "loki"}, // see https://rollupjs.org/guide/en/#outputglobals for pattern
            },
            input: {main: indexHTML},
        },
        // manifest: true,
        outDir: "dist",
        assetsDir: "./",
    },
    plugins: [
        components({
            dirs: [
                "src",
                "node_modules/primevue",
            ],
        }),
        fixLokiRefs(
            process.env.VITE_PAGE_NAME,
            pageUrn
        ),
        vue(),

    ],
    resolve: {
        alias: [
            {
                find: "src",
                replacement: srcDir,
            },
            {
                find: "deps",
                replacement: path.resolve(
                    projectRootDir,
                    "node_modules"
                ),
            },
            {
                find: "@",
                replacement: path.resolve(
                    srcDir,
                    "components"
                ),
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
    root: "./",

    server: {
        cors: true,
        https: false,
        proxy: {
            "^.*loki.web.serviceUrlPrefix.*query": {
                auth: `${process.env.LOKI_USERNAME}:${process.env.LOKI_PASSWORD}`,
                changeOrigin: true,
                target: `https://${process.env.VITE_CLOUD_CODE_NAME}.saplingdata.com/${process.env.VITE_APP_CODE_NAME_TEST}/api/urn/com/loki/core/model/api/query/v/`,
            },
        },
    },
};

/** @type{import('vite').UserConfigFn} */
export default ({command, mode}) => {
    if (command === "serve" || mode === "development") {
        return baseConfig;
    }

    return baseConfig;
};
