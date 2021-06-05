/* eslint-disable @typescript-eslint/restrict-template-expressions */
// @ts-check
/**
 *
 * @typedef {import("./src/shims-vite").ThisEnv} ThisEnv
 *
 */

/** @type {ThisEnv} */

import dotEnv from "dotenv";
dotEnv.config();

const {env} = process;

import path from "path";
import vue from "@vitejs/plugin-vue";
import components from "vite-plugin-components";
import typescript from "@rollup/plugin-typescript";

import {renderLokiIndex} from "./plugins/renderLokiIndex";
import {makeLokiData} from "./plugins/makeLokiData";
import {uploadToLoki} from "./plugins/uploadToLoki";

const projectRootDir = process.cwd();
const srcDir = path.resolve(projectRootDir, "src");
const localLoki = path.resolve(__dirname, "src/loki/index.js");
const lokiAuth = `${env.LOKI_USERNAME}:${env.LOKI_PASSWORD}`;

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
                "src/components"
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
            "^.*loki.web.serviceUrlPrefix.*/query/": makeProxyOpts(`https://${env.VITE_CLOUD_CODE_NAME}.saplingdata.com/${env.VITE_APP_CODE_NAME_TEST}/api/urn/com/loki/core/model/api/query/v/`),
            "^.+urn:com:loki:meta:model:types:webService.+": makeProxyOpts(
                `https://${env.VITE_CLOUD_CODE_NAME}.saplingdata.com/${env.VITE_APP_CODE_NAME_TEST}/api`,
                (/** @type {string} */ p) => p.replace(
                    "$%7Bloki.web.serviceUrlPrefix(%22urn:com:loki:meta:model:types:webService%22)%7D",
                    ""
                )
            ),
            [`^${env.VITE_APP_CODE_NAME}-AppBuilder/api.+`]: makeProxyOpts(`https://${env.VITE_CLOUD_CODE_NAME}.saplingdata.com/${env.VITE_APP_CODE_NAME_TEST}-AppBuilder/api`),
        },
    },
};

/**
 * @param {string} target
 * @param {(arg: string) => string} [rewrite]
 * @returns {import("vite").ProxyOptions}
 */
function makeProxyOpts (target, rewrite = (v) => v) {
    return {
        auth: lokiAuth,
        changeOrigin: true,
        rewrite,
        target,
    };
}
