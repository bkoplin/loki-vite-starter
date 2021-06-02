/* eslint-disable padding-line-between-statements */
import dotEnv from "dotenv";
dotEnv.config();
import path from "path";
import fs from "fs";
import { render } from "ejs";
import klawSync from "klaw-sync";

/**
 * @typedef {import("vite").Plugin} VitePlugin
 * @typedef {import("vite").HtmlTagDescriptor} HtmlTagDescriptor
 * @typedef {import("types").ThisEnv} ThisEnv
 * @typedef {{[Property in keyof ThisEnv]: NonNullable<ThisEnv[Property]>}} ThisEnvType
 * @typedef {import("src/shims-loki").QueryDataObject} QueryDataObject
 */

/**
 * @type {ThisEnvType}
 * */
const {
  VITE_CLOUD_CODE_NAME,
  VITE_APP_CODE_NAME,
  VITE_PAGE_CODE_NAME,
  VITE_PAGE_NAME
} = process.env;
const pageUrn = `urn:com:${VITE_CLOUD_CODE_NAME}:${VITE_APP_CODE_NAME}:app:pages:${VITE_PAGE_CODE_NAME}`;
const LOKI_HEAD_URN = `urn:com:${VITE_CLOUD_CODE_NAME}:${VITE_APP_CODE_NAME}:app:pages:htmlHeadLokiOnly`;
const LOKI_HEAD_TAG = `<#include "${LOKI_HEAD_URN}">`;
/**
 * @param {string} [templatePath]
 * @returns {VitePlugin}
 */
export function renderLokiIndex(templatePath) {
  return {
    name: "vite-build-loki-index",
    enforce: "pre",
    apply: "build",
    transformIndexHtml(_html, ctx) {
      const template = fs.readFileSync(
        templatePath || path.resolve(__dirname, "./template.html"),
        "utf-8"
      );

      /** @type {unknown as string} */
      const html = render(template, { LOKI_HEAD_TAG });

      /** @type {HtmlTagDescriptor} */
      const TITLE_TAG = {
        tag: "title",
        children: VITE_PAGE_NAME
      };
      const tags = [TITLE_TAG];

      if (fs.existsSync(path.resolve(process.cwd(), "../public"))) klawSync(path.resolve(process.cwd(), "../public"), {
        nodir: true,
        filter(item) {
          return path.parse(item.path).ext === ".ico";
        }
      }).forEach(item => {
        const { base } = path.parse(item.path);

        /** @type {HtmlTagDescriptor["attrs"]} */
        const tagAttributes = {
          rel: "icon",
          href: `\${loki.web.resourceUrl('${pageUrn}!${base}')}`,
          type: "image/x-icon"
        };

        tags.push({
          tag: "link",
          attrs: tagAttributes,
          injectTo: "head"
        });
      });
      Object.values(ctx.bundle).forEach(b => {
        /** @type {HtmlTagDescriptor} */
        const scriptTag = {
          tag: "script",
          injectTo: "body"
        };

        /** @type {HtmlTagDescriptor} */
        const linkTag = {
          tag: "link",
          injectTo: "head"
        };
        const { type, fileName } = b;

        if (b.type === "chunk") {
          const attrs = {
            src: `\${loki.web.resourceUrl('${pageUrn}!${fileName}')}`,
            type: "module",
            crossorigin: true
          };

          tags.push({
            ...scriptTag,
            attrs
          });
        } else if (type === "asset") {
          if (fileName.endsWith("css")) {
            const attrs = {
              href: `\${loki.web.resourceUrl('${pageUrn}!${fileName}')}`,
              rel: "stylesheet"
            };

            tags.push({
              ...linkTag,
              attrs
            });
          }
        }
      });

      return {
        html,
        tags
      };
    }
  };
}
