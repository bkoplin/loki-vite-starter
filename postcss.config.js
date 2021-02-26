// const postcssImport = require("postcss-import");
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const postcssUrl = require("postcss-url");

module.exports = {
  plugins: [postcssUrl({ url: "inline" }), tailwindcss, autoprefixer],
};
