// @ts-check
// import dotEnv from "dotenv";

// const env = dotEnv.config().parsed;
export const VITE_APP_CODE_NAME = import.meta.env.VITE_APP_CODE_NAME
export const VITE_CLOUD_CODE_NAME = import.meta.env.VITE_CLOUD_CODE_NAME
export const VITE_PAGE_CODE_NAME = import.meta.env.VITE_PAGE_CODE_NAME
export const VITE_PAGE_NAME = import.meta.env.VITE_PAGE_NAME

export const apiPath = `${VITE_APP_CODE_NAME}-AppBuilder/api`;
export const baseURL = `https://${VITE_CLOUD_CODE_NAME}.saplingdata.com`;
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
  VITE_CLOUD_CODE_NAME,
  VITE_APP_CODE_NAME,
  `app/pages`,
  VITE_PAGE_CODE_NAME,
].join('/');
export const pageUrn = thisPagePath.replace('/', ':');
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
  VITE_CLOUD_CODE_NAME,
  VITE_APP_CODE_NAME,
  `model/queries`,
  VITE_PAGE_CODE_NAME,
].join('/');
export const queryBaseUrn = [
  `urn:com`,
  VITE_CLOUD_CODE_NAME,
  VITE_APP_CODE_NAME,
  `model:queries`,
  VITE_PAGE_CODE_NAME,
].join(":");
export const resourceUrl = [
  apiPath,
  resourceApi,
  "v",
].join('/');
