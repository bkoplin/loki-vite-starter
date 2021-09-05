// @ts-check
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import dotEnv from "dotenv";
dotEnv.config();
import path from "path";
import fs from "fs";
import klawSync from "klaw-sync";
import grayMatter from "gray-matter";
import chalk from "chalk";

/**
 * @typedef {import("vite").Plugin} VitePlugin
 * @typedef {import("types").ThisEnv} ThisEnv
 * @typedef {{[Property in keyof ThisEnv]: NonNullable<ThisEnv[Property]>}} ThisEnvType
 * @typedef {import("src/shims-loki").QueryDataObject} QueryDataObject
 * @typedef {Pick<import("../../src/shims-loki").ChildQuery, "urn" | "queryString" | "dataSpaceUrn" | "queryParams">} ChildQueryObject
 */

const {
    VITE_CLOUD_CODE_NAME,
    VITE_APP_CODE_NAME,
    VITE_PAGE_CODE_NAME,
    VITE_PAGE_NAME,
    VITE_LOKI_USER_URN,
    VITE_PG_DATASPACE,
} = process.env;
const warningColor = chalk.yellowBright;
const dangerColor = chalk.redBright;
const successColor = chalk.greenBright;
const queryUrn = `urn:com:${VITE_CLOUD_CODE_NAME}:${VITE_APP_CODE_NAME}:model:queries:${VITE_PAGE_CODE_NAME}`;
const pageUrn = `urn:com:${VITE_CLOUD_CODE_NAME}:${VITE_APP_CODE_NAME}:app:pages:${VITE_PAGE_CODE_NAME}`;
const apiPath = `${VITE_APP_CODE_NAME}-AppBuilder/api`;
const queryView = "urn/com/loki/modeler/model/types/queryExt";
const pageView = "urn/com/loki/modeler/model/types/combinedPageExt";
const thisPagePath = [
    "urn/com",
    VITE_CLOUD_CODE_NAME,
    VITE_APP_CODE_NAME,
    "app/pages",
    VITE_PAGE_CODE_NAME,
].join("/");
const pageUploadUrl = [
    apiPath,
    pageView,
    "v",
    thisPagePath,
].join("/");

export let queryPath = process.cwd();
const childQueryObjects = klawSync(queryPath, {
    filter: (item) => (/node_modules/u).test(item.path) === false,
    depthLimit: 3,
})
    .filter((item) => item.path.toLowerCase().endsWith("sql"))
    .map((p) => ({
        itemPath: p.path,
        str: fs.readFileSync(p.path, "utf8"),
    }))
    .map(makeChildQueryObject);
const pageDataObject = makePageObject();

/**
 * @type {QueryDataObject}
 */

export const queryDataObject = {
    urn: queryUrn,
    name: `"${VITE_PAGE_NAME}" Queries`,
    summary: `Queries necessary to run page ${VITE_PAGE_NAME} at\n\nurn:com:${VITE_CLOUD_CODE_NAME}:${VITE_APP_CODE_NAME}:app:pages:${VITE_PAGE_CODE_NAME}`,
    inactive: false,
    lastEditByUrn: VITE_LOKI_USER_URN,
    lastEditDate: new Date().toISOString(),
    childQueries: childQueryObjects,
    queryString: "",
    securityFunctionUrns: [`urn:com:reedsmith:${VITE_APP_CODE_NAME}:model:functions:generalAccess`],
};
export const queryUploadUrl = [
    apiPath,
    queryView,
    "v",
    "urn/com",
    VITE_CLOUD_CODE_NAME,
    VITE_APP_CODE_NAME,
    "model/queries",
    VITE_PAGE_CODE_NAME,
].join("/");

export function makePageObject () {
    return {
        urn: pageUrn,
        names: [VITE_PAGE_NAME],
        name: VITE_PAGE_NAME,
        summary: "",
        description: null,
        descriptionHtml: null,
        serviceOutput: {
            outputContentTypeUrn: "urn:com:loki:meta:data:mediaTypes:text%2Fhtml",
            oldContentType: "urn:com:loki:meta:data:mediaTypes:text%2Fhtml",
            maxAge: "0",
        },
        operationImpls: [
            {
                operation: "urn:com:loki:core:model:operations:webService",
                method: "urn:com:loki:core:model:operations:webService:methods:freemarkerPage",
                pageTemplate: `${pageUrn}!index.html`,
                securityFunctionGroups: [],
                actionImpls: [
                    {
                        action: "urn:com:loki:core:model:actions:get",
                        securityFunctionGroups: [`urn:com:${VITE_CLOUD_CODE_NAME}:${VITE_APP_CODE_NAME}:model:functions:generalAccess`],
                    },
                ],
            },
            {
                operation: "urn:com:loki:core:model:operations:render",
                method: "urn:com:loki:freemarker:model:methods:freemarkerRender",
                pageTemplate: `${pageUrn}!index.html`,
                securityFunctionGroups: [],
                actionImpls: [],
            },
        ],
        purposeUrns: ["urn:com:loki:core:data:servicePurposeSet#page"],
        boundToEntityTypeUrn: null,
        entityTypeUrns: [
            "urn:com:loki:meta:model:types:webPage",
            "urn:com:loki:meta:model:types:service",
        ],
        combinedItemUrns: [],
        inactive: false,
        lastEditByUrn: VITE_LOKI_USER_URN,
        lastEditDate: new Date().toISOString(),
        pages: [{urn: `${pageUrn}!index.html`}],
    };
}

/**
 * @param {string} [queryDir]
 * @returns {VitePlugin}
 */
export function makeLokiData (queryDir) {

    if (typeof queryDir !== "undefined") {
        queryPath = queryDir;
    }

    return {
        name: "vite-build-data-objects",
        enforce: "post",
        apply: "build",
        generateBundle () {

            const queryJson = {
                name: "lokiData",
                type: "asset",
                fileName: "queries.json",
                source: JSON.stringify(
                    {
                        lokiData: queryDataObject,
                        url: queryUploadUrl,
                    },
                    null,
                    "\t"
                ),
            };
            const pageJson = {
                name: "lokiData",
                type: "asset",
                fileName: "page.json",
                source: JSON.stringify(
                    {
                        lokiData: pageDataObject,
                        url: pageUploadUrl,
                    },
                    null,
                    "\t"
                ),
            };

            // @ts-expect-error
            this.emitFile(queryJson);
            // @ts-expect-error
            this.emitFile(pageJson);
        },
    };

}

/**
 * @param {{ str: string; itemPath: string; }} queryFile
 * @returns {ChildQueryObject} returns the child query object
 */
function makeChildQueryObject (queryFile) {
    const {str, itemPath} = queryFile;
    const hasFrontMatter = grayMatter.test(str);
    const {name: queryName, base: fileName} = path.parse(itemPath);
    const parsedSqlFile = grayMatter(str);
    /**
     * @property {string} name
     * @property {object} queryParams
     * @property {string} dataSpaceUrn
     * */
    const defaultDataObject = {
        name: queryName,
        queryParams: {},
        dataSpaceUrn: VITE_PG_DATASPACE,
    };
    let queryString = str;

    if (typeof parsedSqlFile.content !== "undefined") {
        queryString = parsedSqlFile.content;
    }
    if (hasFrontMatter) {
        if (typeof parsedSqlFile.data.name === "undefined") {
            const msg = `Warning! You have named the child query for the file ${fileName}. Using file name to name query "${queryName}"`;
            const formattedMsg = warningColor(msg);

            // eslint-disable-next-line no-console
            console.log(formattedMsg);
        } else if (typeof parsedSqlFile.data.name === "string") {
            defaultDataObject.name = parsedSqlFile.data.name;
        }
        if (typeof parsedSqlFile.data.dataSpaceUrn === "undefined") {
            const msg = `Warning! You have not specified a dataSpaceUrn value for query "${defaultDataObject.name}." Using .env dataspace "${VITE_PG_DATASPACE}"`;
            const formattedMsg = warningColor(msg);

            // eslint-disable-next-line no-console
            console.log(formattedMsg);
            defaultDataObject.dataSpaceUrn = VITE_PG_DATASPACE;
        } else if (typeof parsedSqlFile.data.dataSpaceUrn === "string") {
            defaultDataObject.dataSpaceUrn = parsedSqlFile.data.dataSpaceUrn;
        }
    } else {
        const msg = `Warning! No front matter for query at ${fileName}. Using file name to name query "${queryName}," and .env dataspace "${VITE_PG_DATASPACE}"`;
        const formattedMsg = dangerColor(msg);

        // eslint-disable-next-line no-console
        console.log(formattedMsg);
    }
    if ((/(?<![:])[:](?![:])/u).test(queryString)) {
        if ("queryParams" in parsedSqlFile.data === false) {
            const msg = `DANGER! The query at "${fileName}" appears to have a parameter, but there is no parameter definition in the YAML block`;
            const formattedMsg = dangerColor(msg);

            // eslint-disable-next-line no-console
            console.log(formattedMsg);
        }
    }

    /** @type {ChildQueryObject} */
    const queryObject = {
        urn: `${queryUrn}#${defaultDataObject.name}`,
        queryString,
        dataSpaceUrn: defaultDataObject.dataSpaceUrn,
        queryParams: [],
    };

    if (typeof parsedSqlFile.data.queryParams !== "undefined") {
        const paramNames = Object.keys(parsedSqlFile.data.queryParams);

        if (typeof paramNames[0] !== "undefined") {
            paramNames.forEach((k) => {
                if (
                    !parsedSqlFile.data.queryParams[k].startsWith("urn:com:loki:core:model:types:")
                ) {
                    throw Error("You must specify the loki type for the parameter");
                }
                queryObject.queryParams.push({
                    codeName: k,
                    valueTypeUrn: parsedSqlFile.data.queryParams[k],
                });
            });
        }
    }

    return queryObject;
}
