// @ts-check
/* eslint-disable no-unused-vars, no-process-env */

import dotEnv from "dotenv";

// dotEnv.config();

// dotEnv.config({path: `./.env.${process.env.NODE_ENV}`});
import components from "vite-plugin-components";
import path from "path";
import vue from "@vitejs/plugin-vue";
import {inspect} from "util";

import {fixLokiRefs} from "./fixLokiRefs";

const projectRootDir = process.cwd();
const indexHTML = path.resolve(projectRootDir, "index.html");
const srcDir = path.resolve(projectRootDir, "src");
const localLoki = path.resolve(__dirname, "src/loki/index.js");

/** @type{import('vite').UserConfigFn} */
export default ({command, mode}) => {
    dotEnv.config();

    dotEnv.config({path: `./.env.${mode}`});
    const {env} = process;

    console.log(inspect(env, {sorted: true}));
    const pageUrn = makePageUrn(env);
    // const { env.VITE_APP_CODE_NAME } = dev;
    /**
     * @type {import('vite').UserConfig}
     */
    const baseConfig = {
        base: "./",
        build: {
            rollupOptions: {
                external: [localLoki], // see https://rollupjs.org/guide/en/#external
                output: makeRollupOutput(env),
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
            fixLokiRefs(env.VITE_PAGE_NAME, pageUrn),
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
                    replacement: path.resolve(projectRootDir, "node_modules"),
                },
                {
                    find: "@",
                    replacement: path.resolve(srcDir, "components"),
                },
                {
                    find: "store",
                    replacement: path.resolve(srcDir, "store"),
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
            proxy: makeProxySettings(env),
        },
    };

    return baseConfig;
};

/**
 * @param {NodeJS.ProcessEnv} env
 * @returns {Record<string, import("vite").ProxyOptions>}
 */
function makeProxySettings (env) {
    return {
        "^.*loki.web.serviceUrlPrefix.*query": {
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
    };
}

/**
 * @param {NodeJS.ProcessEnv} env
 * @returns {{format: import("rollup").ModuleFormat; name: string; globals: {[index: string]: string}}}
 */
function makeRollupOutput (env) {
    return {
        format: "iife",
        name: env.VITE_PAGE_CODE_NAME,
        globals: {[localLoki]: "loki"},
    };
}

function makePageUrn (env) {
    return `urn:com:${env.VITE_CLOUD_CODE_NAME}:${env.VITE_APP_CODE_NAME}:app:pages:${env.VITE_PAGE_CODE_NAME}`;
}

