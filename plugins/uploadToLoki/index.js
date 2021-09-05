import dotEnv from "dotenv";

dotEnv.config();
import Promise from "bluebird";
import path from "path";
import axios from "axios";
import chalk from "chalk";

/**
 * @typedef {import("vite").Plugin} VitePlugin
 * @typedef {import("vite").HtmlTagDescriptor} HtmlTagDescriptor
 * @typedef {import("types").ThisEnv} ThisEnv
 * @typedef {{[Property in keyof ThisEnv]: NonNullable<ThisEnv[Property]>}} ThisEnvType
 * @typedef {import("src/shims-loki").QueryDataObject} QueryDataObject
 * @typedef {import("src/shims-loki").PageDataObject} PageDataObject
 * @typedef {import("axios").AxiosResponse<{results: {urn: string;}[];}>} LokiListResponse
 */

/** @type {ThisEnvType} */
const {
    VITE_CLOUD_CODE_NAME,
    VITE_LOKI_USERNAME,
    VITE_LOKI_PASSWORD,
    VITE_APP_CODE_NAME,
    VITE_PAGE_CODE_NAME,
} = process.env;

export const warningColor = chalk.yellowBright;
export const dangerColor = chalk.redBright;
export const successColor = chalk.greenBright;
const baseURL = `https://${VITE_CLOUD_CODE_NAME}.saplingdata.com`;

export const lokiSession = axios.create({
    baseURL,
    auth: {
        username: VITE_LOKI_USERNAME,
        password: VITE_LOKI_PASSWORD,
    },
});
const apiPath = `${VITE_APP_CODE_NAME}-AppBuilder/api`;
const resourceApi = "urn/com/loki/core/model/api/resource";
const listApi = "urn/com/loki/core/model/api/list";
const thisPagePath = [
    "urn/com",
    VITE_CLOUD_CODE_NAME,
    VITE_APP_CODE_NAME,
    "app/pages",
    VITE_PAGE_CODE_NAME,
].join("/");
const pageFileListUrl = [
    apiPath,
    listApi,
    "v",
    thisPagePath,
].join("/");
const resourceUrl = [
    apiPath,
    resourceApi,
    "v",
].join("/");
const pageFileUploadUrl = [
    apiPath,
    resourceApi,
    "v",
    `${thisPagePath}!`,
].join("/");
const typeMap = new Map([
    [
        ".js",
        "application/javascript",
    ],
    [
        ".html",
        "text/html",
    ],
    [
        ".css",
        "text/css",
    ],
    [
        ".json",
        "application/json",
    ],
    [
        ".ico",
        "image/x-icon",
    ],
]);

/**
 * @returns {import("vite").Plugin}
 */

export function uploadToLoki () {
    return {
        name: "vite-loki-upload-plugin",
        enforce: "post",
        apply: "build",
        async writeBundle (options, bundle) {
            await deleteCurrentFiles();

            await Promise.each(Object.values(bundle), async (b) => {
                const uploadUrl = pageFileUploadUrl + b.fileName;
                const {ext} = path.parse(b.fileName);
                const headers = {"Content-Type": typeMap.get(ext)};

                if (b.type === "chunk") {
                    await lokiSession.post(uploadUrl, b.code, {headers}).then(() => {
                        console.log(successColor(`${b.fileName} uploaded to ${uploadUrl}`));
                    });
                } else if (b.type === "asset") {
                    if (b.name === "lokiData" && typeof b.source === "string") {
                        /** @type {unknown} */
                        const parsedSource = JSON.parse(b.source);

                        if (
                            typeof parsedSource.url !== "undefined" &&
              typeof parsedSource.lokiData !== "undefined"
                        ) {

                            /**
               * @type {{url: string; lokiData: QueryDataObject|PageDataObject}}
               */
                            const {url, lokiData} = parsedSource;

                            await lokiSession
                                .post(url, lokiData)
                                .then(() => {
                                    console.log(successColor(`\n"${lokiData.urn}" saved`));
                                })
                                .catch(() => {
                                    console.log(dangerColor(`\nThere was a problem saving "${lokiData.urn}"`));
                                });
                        }
                    } else {
                        await lokiSession
                            .post(uploadUrl, b.source, {headers})
                            .then(() => {
                                console.log(successColor(`${b.fileName} uploaded to ${uploadUrl}`));
                            });
                    }
                }
            });
        },
    };
}
async function deleteCurrentFiles () {

    /** @type {LokiListResponse} */
    const getCurrentFiles = await lokiSession.get(pageFileListUrl);
    const currentFiles = getCurrentFiles.data.results;

    if (currentFiles) {
        await Promise.each(currentFiles, async (file) => {
            const deleteUrl = path.join(resourceUrl, file.urn.replace(/[:]/gu, "/"));

            // eslint-disable-next-line no-await-in-loop
            await lokiSession
                .delete(deleteUrl)
                .then(() => {
                    console.log(warningColor(`${file.urn} was deleted!`));
                })
                .catch((error) => {
                    console.log(dangerColor(`\nThere was a problem deleting ${file.urn}...`));
                    console.error(error.response.data.errors);
                });
        });
    }
    console.log(warningColor("\nFinished clearing previous build!"));

    return currentFiles;
}
