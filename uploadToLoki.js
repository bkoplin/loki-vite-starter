// @ts-check
/* eslint-disable no-console, no-loop-func, max-len, max-lines-per-function, max-statements, max-lines */
require("dotenv").config();
require("dotenv").config({path: "./.env.production"});
const axios = require("axios").default;
const fs = require("fs");
const grayMatter = require("gray-matter");
const _ = require("lodash");
const path = require("path");
const babel = require("@babel/core");
const klawSync = require("klaw-sync");
const {
    LOKI_USERNAME,
    LOKI_PASSWORD,
    LOKI_USER_URN,
    VITE_CLOUD_CODE_NAME,
    VITE_APP_CODE_NAME,
    VITE_PAGE_NAME,
    VITE_PAGE_CODE_NAME,
} = process.env;
const apiPath = `${VITE_APP_CODE_NAME}-AppBuilder/api`;
const baseURL = `https://${VITE_CLOUD_CODE_NAME}.saplingdata.com`;
const resourceApi = "urn/com/loki/core/model/api/resource";
const listApi = "urn/com/loki/core/model/api/list";
const pageView = "urn/com/loki/modeler/model/types/combinedPageExt";
const queryView = "urn/com/loki/modeler/model/types/queryExt";
const webserviceView = "urn/com/loki/modeler/model/types/webServiceExt";
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
const pageFileUploadUrl = [
    apiPath,
    resourceApi,
    "v",
    `${thisPagePath}!`,
].join("/");
const pageDataUploadUrl = [
    apiPath,
    pageView,
    "v",
    thisPagePath,
].join("/");
const queryUploadUrl = [
    apiPath,
    queryView,
    "v",
    "urn/com",
    VITE_CLOUD_CODE_NAME,
    VITE_APP_CODE_NAME,
    "model/queries",
    VITE_PAGE_CODE_NAME,
].join("/");
const webServiceUploadUrl = [
    apiPath,
    webserviceView,
    "v",
    "urn/com",
    VITE_CLOUD_CODE_NAME,
    VITE_APP_CODE_NAME,
    "model/webServices",
].join("/");
const resourceUrl = [
    apiPath,
    resourceApi,
    "v",
].join("/");
const lokiSession = axios.create({
    baseURL,
    auth: {
        username: LOKI_USERNAME,
        password: LOKI_PASSWORD,
    },
});
const distDir = "./dist";
const queryDir = "./src/queries";
const webServiceDir = "./src/webServices";
const pushToLoki = async () => {
    const pageDataObject = pageData();
    const distFiles = fs.readdirSync(distDir);
    const queryFiles = fs.
        readdirSync(queryDir).
        filter((p) => p.endsWith(".sql") || p.endsWith(".SQL"));
    const webServiceFiles = klawSync(
        webServiceDir,
        {
            filter: (item) => [
                ".js",
                ".JS",
            ].includes(path.parse(item.path).ext),
            nodir: true,
        }
    ).map((item) => item.path);

    if (queryFiles.length) {
        const queryData = getQueryData();

        await lokiSession.post(
            queryUploadUrl,
            queryData
        ).then(() => {
            console.log(`Query "${queryData.name}" uploaded to ${queryData.urn}`);
        });
    }
    if (webServiceFiles.length) {
        webServiceFiles.forEach(uploadWebservice);
    }

    await lokiSession.post(
        pageDataUploadUrl,
        pageDataObject
    ).then(() => {
        console.log(`Loki data for "${pageDataObject.name}" saved to ${pageDataObject.urn} (${pageDataUploadUrl})`);
    });
    distFiles.forEach((file) => {
        const filePath = `./dist/${file}`;

        fs.readFile(
            filePath,
            "utf8",
            (_err, data) => {
            // const baseFileName = file;
                const baseFileName = file.replace(
                    `${VITE_PAGE_CODE_NAME}!`,
                    ""
                );
                const uploadUrl = pageFileUploadUrl + baseFileName;

                lokiSession.
                    post(
                        uploadUrl,
                        data,
                        {headers: {"Content-Type": "text/plain"}}
                    ).
                    then(() => {
                        console.log(`${file} uploaded to ${uploadUrl}`);
                    });
            }
        );
    });
};

async function uploadWebservice (webserviceFilePath) {
    const {name, ext} = path.parse(webserviceFilePath);
    const webserviceData = getWebserviceData(name);
    const filename = `${name}${ext}`;
    const dataUploadUrl = `${webServiceUploadUrl}/${name}`;
    const codeUploadUrl = `${resourceUrl}/${webserviceData.urn.replace(
        ":",
        "/"
    )}!${filename}`;
    const babelOptions = {
        babelrc: false,
        configFile: false,
        filename,
        presets: [
            [
                "@babel/preset-env",
                {
                    loose: true,
                    modules: false,
                },
            ],
        ],
    };
    const {code} = await babel.transformAsync(
        fs.readFileSync(
            webserviceFilePath,
            "utf8"
        ),
        babelOptions
    );

    await lokiSession.
        post(
            dataUploadUrl,
            webserviceData
        );
    console.log(`Web service "${name}" uploaded to ${webserviceData.urn}`);

    await lokiSession.
        post(
            codeUploadUrl,
            code,
            {headers: {"Content-Type": "text/javascript"}}
        ).
        catch((e) => console.log(e));
    console.log(`${filename} uploaded to ${codeUploadUrl}`);
}

function getCurrentFiles () {
    return lokiSession.
        get(pageFileListUrl).
        then((response) => response.data.results).
        catch((error) => {
            console.error(error.response);
        });
}

async function deleteCurrentFiles (files) {
    console.log(`\x1b[34mDeleting ${files.length} files from the page...\x1b[89m`);

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < files.length; i++) {
        const deleteUrl = path.join(
            resourceUrl,
            files[i].urn.replace(
                /[:]/g,
                "/"
            )
        );

        // eslint-disable-next-line no-await-in-loop
        await lokiSession.
            delete(deleteUrl).
            then(() => {
                console.log(`\x1b[32m${files[i].urn} was deleted!\x1b[32m`);
            }).
            catch((error) => {
                console.log(`There was a problem deleting ${files[i].urn}...`);
                console.error(error.response.data.errors);
            });
    }
}

async function clearFiles () {
    const currentFiles = await getCurrentFiles();

    if (currentFiles) {
        await deleteCurrentFiles(currentFiles);
    }
    console.log("Finished clearing previous build!");
}

const deployApp = async () => {
    await clearFiles();
    pushToLoki();
};

/**
 * @returns {import("./types").PageDataObject} A data object defining the page to save in AppBuilder
 */
function pageData () {
    return {
        urn: `urn:com:${VITE_CLOUD_CODE_NAME}:${VITE_APP_CODE_NAME}:app:pages:${VITE_PAGE_CODE_NAME}`,
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
                method:
          "urn:com:loki:core:model:operations:webService:methods:freemarkerPage",
                pageTemplate: `urn:com:${VITE_CLOUD_CODE_NAME}:${VITE_APP_CODE_NAME}:app:pages:${VITE_PAGE_CODE_NAME}!index.html`,
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
                pageTemplate: `urn:com:${VITE_CLOUD_CODE_NAME}:${VITE_APP_CODE_NAME}:app:pages:${VITE_PAGE_CODE_NAME}!index.html`,
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
        lastEditByUrn: LOKI_USER_URN,
        lastEditDate: new Date().toISOString(),
        pages: [{urn: `urn:com:${VITE_CLOUD_CODE_NAME}:${VITE_APP_CODE_NAME}:app:pages:${VITE_PAGE_CODE_NAME}!index.html`}],
    };
}

/**
 * @returns {import("./types").QueryDataObject} A data object defining the query to save in AppBuilder
 */
function getQueryData () {
    const queryUrn = `urn:com:${VITE_CLOUD_CODE_NAME}:${VITE_APP_CODE_NAME}:model:queries:${VITE_PAGE_CODE_NAME}`;
    const childQueries = [];

    fs.readdirSync(queryDir).
        filter((p) => p.endsWith(".sql") || p.endsWith(".SQL")).
        map((p) => fs.readFileSync(
            path.resolve(
                queryDir,
                p
            ),
            "utf8"
        )).
        forEach((str) => {
            const hasFrontMatter = grayMatter.test(str);

            if (!hasFrontMatter) {
                throw Error("You must include a YAML block with a name property and a dataSpaceUrn property");
            }
            const {data, content: queryString} = grayMatter(str);

            if (!data.dataSpaceUrn) {
                throw Error("You must specify a dataSpaceUrn");
            }
            if (!data.name) {
                throw Error("You must give the child query a name");
            }

            /** @type {import("./types").ChildQuery} */
            const queryObject = {
                urn: `${queryUrn}#${data.name}`,
                queryString,
                dataSpaceUrn: data.dataSpaceUrn,
                queryParams: [],
            };

            if (data.queryParams) {
                const paramNames = Object.keys(data.queryParams);

                paramNames.forEach((k) => {
                    if (
                        !data.queryParams[k].startsWith("urn:com:loki:core:model:types:")
                    ) {
                        throw Error("You must specify the loki type for the parameter");
                    }
                    queryObject.queryParams.push({
                        codeName: k,
                        valueTypeUrn: data.queryParams[k],
                    });
                });
            }
            childQueries.push(queryObject);
        });

    return {
        childQueries,
        inactive: false,
        lastEditByUrn: LOKI_USER_URN,
        lastEditDate: new Date().toISOString(),
        name: `"${VITE_PAGE_NAME}" Queries`,
        queryString: "",
        securityFunctionUrns: [`urn:com:reedsmith:${VITE_APP_CODE_NAME}:model:functions:generalAccess`],
        summary: `Queries necessary to run page ${VITE_PAGE_NAME} at\n\nurn:com:${VITE_CLOUD_CODE_NAME}:${VITE_APP_CODE_NAME}:app:pages:${VITE_PAGE_CODE_NAME}`,
        urn: queryUrn,
    };
}

/**
 * @returns {import("./types").WebserviceDataObject} A data object defining the query to save in AppBuilder
 */
function getWebserviceData (fileName) {
    const webserviceUrn = `urn:com:${VITE_CLOUD_CODE_NAME}:${VITE_APP_CODE_NAME}:model:webServices:${fileName}`;

    return {
        boundToEntityTypeUrn: null,
        description: "",
        entityTypeUrns: [
            "urn:com:loki:meta:model:types:webService",
            "urn:com:loki:meta:model:types:service",
        ],
        inactive: false,
        lastEditByUrn: "urn:com:reedsmith:domain:security:users:benKoplin",
        lastEditDate: new Date().toISOString(),
        name: `${VITE_PAGE_NAME} ${_.upperCase(fileName)} webservice`,
        operationImpls: [
            {
                actionImpls: [
                    {
                        action: "urn:com:loki:core:model:actions:get",
                        securityFunctionGroups: [`urn:com:reedsmith:${VITE_APP_CODE_NAME}:model:functions:generalAccess`],
                    },
                ],
                executionScriptUrn: `${webserviceUrn}!${fileName}.js`,
                method: "urn:com:loki:js:model:methods:javaScriptWebService",
                operation: "urn:com:loki:core:model:operations:webService",
                securityFunctionGroups: [`urn:com:reedsmith:${VITE_APP_CODE_NAME}:model:functions:generalAccess`],
            },
        ],
        purposeUrns: ["urn:com:loki:core:data:servicePurposeSet#webServiceApi"],
        summary: `Webservice for ${VITE_PAGE_NAME} page operations`,
        urn: webserviceUrn,
    };
}

deployApp();
