const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const postcssUrl = require("postcss-url");

module.exports = {
  // plugins: {tailwindcss: {}, autoprefixer: {}}
  plugins: [
    postcssUrl({ url: "inline" }),
    tailwindcss,
    autoprefixer,
  ],
};
