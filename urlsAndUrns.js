// @ts-check

/**
 *
 * @typedef {import('./package.json')} PackageJson
 * @type {PackageJson}
 * @property {PackageJson['appInfo']} appInfo - The application definition object
 * @property {PackageJson['appInfo']['loki']} appInfo.loki - The Loki portion of the application definition
 * @property {PackageJson['appInfo']['loki']['appCodeName']} appInfo.loki.appCodeName - The URN segment identifying the Loki app that you plan to deploy to (the last segment of loki.app.rootUrn)
 * @property {PackageJson['appInfo']['loki']['pageCodeName']} appInfo.loki.pageCodeName - The page in Loki's App Builder that you plan to deploy to
 * @property {PackageJson['appInfo']['loki']['cloudPrefix']} appInfo.loki.cloudPrefix - The subdomain of your cloud's url
 * @property {PackageJson['appInfo']['loki']['cloudCodeName']} appInfo.loki.cloudCodeName - The name of your cloud process.environment
 * @property {PackageJson['appInfo']['loki']['pageName']} appInfo.loki.pageName - The name of the page (the page title)
 * */
import packageJson from "./package.json";

export const { appInfo } = packageJson;
export const apiPath = `${appInfo.loki.appCodeName}-AppBuilder/api`;
export const baseURL = `https://${appInfo.loki.cloudPrefix}.saplingdata.com`;
export const resourceApi = `urn/com/loki/core/model/api/resource`;
export const listApi = `urn/com/loki/core/model/api/list`;
export const pageView = `urn/com/loki/modeler/model/types/combinedPageExt`;
export const queryApi = `urn/com/loki/core/model/api/query`;
export const queryUrl = [
  queryApi,
  "v/",
].join('/');
export const queryView = `urn/com/loki/modeler/model/types/queryExt`;
export const thisPagePath = [
  `urn/com`,
  appInfo.loki.cloudCodeName,
  appInfo.loki.appCodeName,
  `app/pages`,
  appInfo.loki.pageCodeName,
].join('/');
export const pageFileListUrl = [
  apiPath,
  listApi,
  "v",
  thisPagePath,
].join('/');
export const pageFileUploadUrl = [
  apiPath,
  resourceApi,
  "v",
  `${thisPagePath}!`,
].join('/');
export const pageDataUploadUrl = [
  apiPath,
  pageView,
  "v",
  thisPagePath,
].join('/');
export const queryUploadUrl = [
  apiPath,
  queryView,
  "v",
  `urn/com`,
  appInfo.loki.cloudCodeName,
  appInfo.loki.appCodeName,
  `model/queries`,
  appInfo.loki.pageCodeName,
].join('/');
export const queryBaseUrn = [
  `urn:com`,
  appInfo.loki.cloudPrefix,
  appInfo.loki.appCodeName,
  `model:queries`,
  appInfo.loki.pageCodeName,
].join(":");
export const resourceUrl = [
  apiPath,
  resourceApi,
  "v",
].join('/');
