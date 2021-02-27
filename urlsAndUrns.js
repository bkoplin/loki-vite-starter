// @ts-check
/* eslint-disable max-len */

/**
 *
 * @typedef {import('./package.json')} PackageJson
 * @type {PackageJson}
 * @property {PackageJson['appInfo']} appInfo - The application definition object
 * @property {PackageJson['appInfo']['loki']} appInfo.loki - The Loki portion of the application definition
 * @property {PackageJson['appInfo']['loki']['appCodeName']} appInfo.loki.appCodeName - The URN segment identifying the Loki app that you plan to deploy to (the last segment of loki.app.rootUrn)
 * @property {PackageJson['appInfo']['loki']['pageCodeName']} appInfo.loki.pageCodeName - The page in Loki's App Builder that you plan to deploy to
 * @property {PackageJson['appInfo']['loki']['cloudPrefix']} appInfo.loki.cloudPrefix - The subdomain of your cloud's url
 * @property {PackageJson['appInfo']['loki']['cloudCodeName']} appInfo.loki.cloudCodeName - The name of your cloud environment
 * @property {PackageJson['appInfo']['loki']['pageName']} appInfo.loki.pageName - The name of the page (the page title)
 * */
import packageJson from "./package.json";

const {
  appInfo: { loki },
} = packageJson;
export const baseUrl = `https://${loki.cloudPrefix}.saplingdata.com/${loki.appCodeName}-AppBuilder/api`;
export const resourceUrl = "/urn/com/loki/core/model/api/resource/v";
export const pageFileListUrl = `/urn/com/loki/core/model/api/list/v/urn/com/${loki.cloudCodeName}/${loki.appCodeName}/app/pages/${loki.pageCodeName}?format=json`;
export const pageFileUploadUrl = `/urn/com/loki/core/model/api/resource/v/urn/com/${loki.cloudCodeName}/${loki.appCodeName}/app/pages/${loki.pageCodeName}!`;
export const pageDataUploadUrl = `/urn/com/loki/modeler/model/types/combinedPageExt/v/urn/com/${loki.cloudPrefix}/${loki.appCodeName}/app/pages/${loki.pageCodeName}`;
export const queryUploadUrl = `/urn/com/loki/modeler/model/types/queryExt/v/urn/com/${loki.cloudPrefix}/${loki.appCodeName}/model/queries/${loki.pageCodeName}`;
export const queryBaseUrn = `urn:com:${loki.cloudPrefix}:${loki.appCodeName}:model:queries:${loki.pageCodeName}`;

export const queryApiUrl = `/${loki.appCodeName}/api/urn/com/loki/core/model/api/query/v`;
