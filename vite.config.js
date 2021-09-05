/* eslint-disable lines-around-comment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/**
 *
 * @typedef {import("./src/shims-vite").ThisEnv} ThisEnv
 *
 */

/** @type {ThisEnv} */

import path from 'path';
import dotEnv from 'dotenv';

import vue from '@vitejs/plugin-vue';
import typescript from '@rollup/plugin-typescript';

import { renderLokiIndex } from './plugins/renderLokiIndex';
import { makeLokiData } from './plugins/makeLokiData';
import { uploadToLoki } from './plugins/uploadToLoki';
dotEnv.config();

const { env } = process;
const projectRootDir = process.cwd();
const srcDir = path.resolve(projectRootDir, 'src');
const lokiAuth = `${env.VITE_LOKI_USERNAME}:${env.VITE_LOKI_PASSWORD}`;
/**
 *
 * @type {import('rollup').RollupOptions}
 */
const rollupOptions = {
  output: {
    entryFileNames: '[name]-[hash].js',
    assetFileNames: '[name]-[hash][extname]',
    chunkFileNames: '[name]-[hash].js',
  },
};

/**
 *
 * @type {import('vite').UserConfig}
 */
export default {
  base: './',
  publicDir: './public',
  build: {
    assetsDir: './',
    cssCodeSplit: false,
    chunkSizeWarningLimit: 1500,
    lib: {
      entry: 'index.html',
      name: env.VITE_PAGE_CODE_NAME,
      formats: ['es'],
    },
    manifest: true,
    outDir: 'dist',
    rollupOptions,
  },
  plugins: [
    // typescript(),
    vue(),
    renderLokiIndex(),
    makeLokiData(),
    uploadToLoki(),
  ],
  resolve: { alias: [{ find: '@', replacement: srcDir }] },
  root: './',

  server: {
    cors: true,
    https: false,
    proxy: {
      '^.*loki.web.serviceUrlPrefix.*/query/': makeProxyOpts(
        `https://${env.VITE_CLOUD_CODE_NAME}.saplingdata.com/${env.VITE_APP_CODE_NAME_TEST}/api/urn/com/loki/core/model/api/query/v/`
      ),
      [`/${env.VITE_APP_CODE_NAME_TEST}/api/urn/com/loki/core/model/api/query/v/`]:
        makeProxyOpts(
          `https://${env.VITE_CLOUD_CODE_NAME}.saplingdata.com/${env.VITE_APP_CODE_NAME_TEST}/api/urn/com/loki/core/model/api/query/v/`
        ),
      '^.+urn:com:loki:meta:model:types:webService.+': makeProxyOpts(
        `https://${env.VITE_CLOUD_CODE_NAME}.saplingdata.com/${env.VITE_APP_CODE_NAME_TEST}/api`,
        (/** @type {string} */ p) =>
          p.replace(
            '$%7Bloki.web.serviceUrlPrefix(%22urn:com:loki:meta:model:types:webService%22)%7D',
            ''
          )
      ),
      [`^${env.VITE_APP_CODE_NAME}-AppBuilder/api.+`]: makeProxyOpts(
        `https://${env.VITE_CLOUD_CODE_NAME}.saplingdata.com/${env.VITE_APP_CODE_NAME_TEST}-AppBuilder/api`
      ),
    },
  },
};

/**
 * @param {string} target
 * @param {(arg: string) => string} [rewrite]
 * @returns {import("vite").ProxyOptions}
 */
function makeProxyOpts(target, rewrite = (v) => v) {
  return {
    auth: lokiAuth,
    changeOrigin: true,
    rewrite,
    target,
  };
}
