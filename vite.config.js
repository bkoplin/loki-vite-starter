// @ts-check
/* eslint-disable padding-line-between-statements,no-unused-vars, no-process-env */

import dotEnv from "dotenv";
dotEnv.config();

/**
 *
 * @typedef {import("./types").ThisEnv} ThisEnv
 *
 */

/** @type {ThisEnv} */
// @ts-expect-error
const {env} = process;
console.log(env)
import path from "path";
import vue from "@vitejs/plugin-vue";
import components from "vite-plugin-components";
import typescript from "@rollup/plugin-typescript";

import {renderLokiIndex} from "./plugins/renderLokiIndex";
import {makeLokiData} from "./plugins/makeLokiData";
import {uploadToLoki} from "./plugins/uploadToLoki";

const projectRootDir = process.cwd();
const indexHTML = path.resolve(projectRootDir, "index.html");
const srcDir = path.resolve(projectRootDir, "src");
const localLoki = path.resolve(__dirname, "src/loki/index.js");

/** @type{import('vite').UserConfig} */
export default {
    base: "./",
    publicDir: "./public",
    build: {
        assetsDir: "./",
        cssCodeSplit: false,
        chunkSizeWarningLimit: 1500,
        lib: {
            // entry: path.resolve(__dirname, "src/main.ts"),
            entry: "index.html",
            name: env.VITE_PAGE_CODE_NAME,
            formats: ["umd"],
        },
        manifest: true,
        outDir: "dist",
        rollupOptions: {
            // see https://rollupjs.org/guide/en/#external
            external: [localLoki],
            output: {globals: {[localLoki]: "loki"}},
        },
    },
    plugins: [
        typescript(),
        components({
            dirs: [
                "src",
                "src/components",
                "node_modules/primevue",
            ],
        }),
        vue(),
        renderLokiIndex(),
        makeLokiData(),
        uploadToLoki(),
    ],
    resolve: {alias: {"@": srcDir}},
    root: "./",

    server: {
        cors: true,
        https: false,
        proxy: {
            "^.*loki.web.serviceUrlPrefix.*/query/": {
                auth: `${env.LOKI_USERNAME}:${env.LOKI_PASSWORD}`,
                changeOrigin: true,
                target: `https://${env.VITE_CLOUD_CODE_NAME}.saplingdata.com/${env.VITE_APP_CODE_NAME_TEST}/api/urn/com/loki/core/model/api/query/v/`,
            },
            "^.+urn:com:loki:meta:model:types:webService.+": {
                auth: `${env.LOKI_USERNAME}:${env.LOKI_PASSWORD}`,
                changeOrigin: true,
                rewrite: (p) => p.replace(
                    "$%7Bloki.web.serviceUrlPrefix(%22urn:com:loki:meta:model:types:webService%22)%7D",
                    ""
                ),
                target: `https://${env.VITE_CLOUD_CODE_NAME}.saplingdata.com/${env.VITE_APP_CODE_NAME_TEST}/api`,
            },
            "^delorean-AppBuilder/api.+": {
                auth: `${env.LOKI_USERNAME}:${env.LOKI_PASSWORD}`,
                changeOrigin: true,
                target: `https://${env.VITE_CLOUD_CODE_NAME}.saplingdata.com/${env.VITE_APP_CODE_NAME_TEST}-AppBuilder/api`,
            },
        },
    },
};
