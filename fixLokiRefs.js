// @ts-check
/* eslint-disable max-len */
// console.log(inspect(process.env, {sorted: true}));

/**
 * @param {string} h The compiled index.html HTML string, with reference to the bundled resources f in script and link taks
 * @param {string} f A bundle file name to replace with "${loki.web.resourceUrl('[f]')}"
 * @param {string} u The full URN of the page
 * @returns {string} the html string with paths in ref and src attributes replaced with loki.web.resourceUrl() functions
 */
 function renameResources (h, f, u) {
  const urn = `${u}!`;
  const regexp = new RegExp(`(=")(?:)[^=]*(?:)(${f})(?:)[^=]*(")`, "g");

  return h.replace(regexp, `$1\${loki.web.resourceUrl('${urn}$2')}$3`);
}

/**
* @param {string} pageName The page name for the title node
* @param {string} pageUrn The full URN for the page
* @returns {import('vite').Plugin} A Vite plugin to replace paths ref and src attributes in the compiled html with loki.web.resourceUrl() functions
*/
function fixLokiRefs (pageName, pageUrn) {

  /** @type {import('vite').Plugin} */
  const def = {
      name: "html-transform",
      enforce: "post",
      apply: "build",
      transformIndexHtml (html, ctx) {
          const bundleNames = Object.keys(ctx.bundle);

          bundleNames.push("favicon.ico");
          // eslint-disable-next-line no-use-before-define
          const n = bundleNames
              .reduce((r, b) => renameResources(r, b, pageUrn), html)
              .replace("<meta charset=\"UTF-8\" />", "<meta charset=\"UTF-8\" />\n<#include \"urn:com:reedsmith:delorean:app:pages:htmlHeadLokiOnly\">");
          /** @type {import('vite').HtmlTagDescriptor[]} */
          const tags = [
              {
                  tag: "title",
                  children: pageName,
              },
          ];

          return {
              html: n,
              tags,
          };
      },
  };

  return def;
}

// eslint-disable-next-line import/prefer-default-export
export {fixLokiRefs};
