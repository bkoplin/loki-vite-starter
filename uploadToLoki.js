// @ts-check
/* eslint-disable no-console, no-loop-func, max-len */
require('dotenv').config()
const axios = require('axios').default;
const fs = require("fs");
const grayMatter = require("gray-matter");
const path = require("path");
const esm = require('esm')(module);


const {
  appInfo, queryUploadUrl, pageDataUploadUrl, pageFileUploadUrl, pageFileListUrl, resourceUrl, baseURL
} = esm('./urlsAndUrns.js');

const { loki } = appInfo;
const lokiSession = axios.create({
  baseURL,
  auth: {
    username: process.env.LOKI_USERNAME,
    password: process.env.LOKI_PASSWORD,
  },
});


const pushToLoki = async () => {
  const pageDataObject = pageData(loki);
  const distFiles = fs.readdirSync("./dist");
  const queryDir = "./src/queries";
  const queryFiles = fs
    .readdirSync(queryDir)
    .filter((p) => p.endsWith(".sql") || p.endsWith(".SQL"));
  if (queryFiles.length) {
    const queryData = getQueryData(loki);
    await lokiSession.post(queryUploadUrl, queryData).then(() => {
      console.log(`Query "${queryData.name}" uploaded to ${queryData.urn}`);
    });
  }

  await lokiSession.post(pageDataUploadUrl, pageDataObject).then(() => {
    console.log(
      `Loki data for "${pageDataObject.name}" saved to ${pageDataObject.urn} (${pageDataUploadUrl})`,
    );
  });
  distFiles.forEach((file) => {
    const filePath = `./dist/${file}`;

    fs.readFile(filePath, "utf8", (err, data) => {
      // const baseFileName = file;
      const baseFileName = file.replace(`${loki.pageCodeName}!`, '');
      const uploadUrl = pageFileUploadUrl + baseFileName;
      lokiSession
        .post(uploadUrl, data, {
          headers: {
            "Content-Type": "text/plain",
          },
        })
        .then(() => {
          console.log(`${file} uploaded to ${uploadUrl}`);
        });
    });
  });
};

function getCurrentFiles() {
  return lokiSession
    .get(pageFileListUrl)
    .then((response) => response.data.results)
    .catch((error) => {
      console.error(error.response.data.errors);
    });
}

async function deleteCurrentFiles(files) {
  console.log(
    `\x1b[34mDeleting ${files.length} files from the page...\x1b[89m`,
  );

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < files.length; i++) {
    const deleteUrl = path.join(resourceUrl, files[i].urn.replace(/[:]/g, "/"));
    // eslint-disable-next-line no-await-in-loop
    await lokiSession
      .delete(deleteUrl)
      .then(() => {
        console.log(`\x1b[32m${files[i].urn} was deleted!\x1b[32m`);
      })
      .catch((error) => {
        console.log(`There was a problem deleting ${files[i].urn}...`);
        console.error(error.response.data.errors);
      });
  }
}

async function clearFiles() {
  const currentFiles = await getCurrentFiles();
  await deleteCurrentFiles(currentFiles);
  console.log("Finished clearing previous build!");
}

const deployApp = async () => {
  await clearFiles();
  pushToLoki();
};

/**
 * @param {import("./urlsAndUrns.js").PackageJson["appInfo"]["loki"]} l The appInfo.loki attribute of package.json for the application
 * @returns {import("./types").PageDataObject} A data object defining the page to save in AppBuilder
 */
function pageData(l) {
  return {
    urn: `urn:com:${l.cloudPrefix}:${l.appCodeName}:app:pages:${l.pageCodeName}`,
    names: [l.pageName],
    name: l.pageName,
    summary: "",
    description: null,
    descriptionHtml: null,
    serviceOutput: {
      outputContentTypeUrn:
                "urn:com:loki:meta:data:mediaTypes:text%2Fhtml",
      oldContentType: "urn:com:loki:meta:data:mediaTypes:text%2Fhtml",
      maxAge: "0",
    },
    operationImpls: [
      {
        operation: "urn:com:loki:core:model:operations:webService",
        method:
                    "urn:com:loki:core:model:operations:webService:methods:freemarkerPage",
        pageTemplate: `urn:com:${l.cloudPrefix}:${l.appCodeName}:app:pages:${l.pageCodeName}!index.html`,
        securityFunctionGroups: [],
        actionImpls: [{
          action: "urn:com:loki:core:model:actions:get",
          securityFunctionGroups: [`urn:com:${l.cloudPrefix}:${l.appCodeName}:model:functions:generalAccess`],
        }],
      },
      {
        operation: "urn:com:loki:core:model:operations:render",
        method:
                    "urn:com:loki:freemarker:model:methods:freemarkerRender",
        pageTemplate: `urn:com:${l.cloudPrefix}:${l.appCodeName}:app:pages:${l.pageCodeName}!index.html`,
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
    lastEditByUrn: process.env.LOKI_USER_URN,
    lastEditDate: new Date().toISOString(),
    pages: [{
      urn: `urn:com:${l.cloudPrefix}:${l.appCodeName}:app:pages:${l.pageCodeName}!index.html`,
    }],
  };
}
/**
 * @param {import("./urlsAndUrns.js").PackageJson["appInfo"]["loki"]} l The appInfo.loki attribute of package.json for the application
 * @returns {import("./types").QueryDataObject} A data object defining the query to save in AppBuilder
 */
function getQueryData(l) {
  const queryUrn = `urn:com:${l.cloudPrefix}:${l.appCodeName}:model:queries:${l.pageCodeName}`;
  const srcDir = "./src/queries";
  const childQueries = [];

  fs
    .readdirSync(srcDir)
    .filter((p) => p.endsWith(".sql") || p.endsWith(".SQL"))
    .map((p) => fs.readFileSync(path.resolve(srcDir, p), "utf8"))
    .forEach((str) => {
      const hasFrontMatter = grayMatter.test(str);
      if (!hasFrontMatter) throw Error("You must include a YAML block with a name property and a dataSpaceUrn property");
      const { data, content: queryString } = grayMatter(str);
      if (!data.dataSpaceUrn) throw Error("You must specify a dataSpaceUrn");
      if (!data.name) throw Error('You must give the child query a name');
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
          if (!data.queryParams[k].startsWith("urn:com:loki:core:model:types:")) throw Error("You must specify the loki type for the parameter");
          queryObject.queryParams.push({ codeName: k, valueTypeUrn: data.queryParams[k] });
        });
      }
      childQueries.push(queryObject);
    });

  return {
    urn: queryUrn,
    name: `${l.pageName} Queries`,
    queryString: '',
    summary: `Queries necessary to run page ${l.pageName} at urn:com:${l.cloudPrefix}:${l.appCodeName}:app:pages:${l.pageCodeName}`,
    securityFunctionUrns: [`urn:com:reedsmith:${l.appCodeName}:model:functions:generalAccess`],
    childQueries,
    inactive: false,
    lastEditDate: (new Date()).toISOString(),
    lastEditByUrn: process.env.LOKI_USER_URN,
  };
}

deployApp();
