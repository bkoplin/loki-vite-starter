/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
const plugins = [
  require('postcss-import'),
  require('precss'),
  require('postcss-sorting'),
  require('tailwindcss')({ ...require('./tailwind.config') }),
  require('autoprefixer'),
  // require('postcss-pxtorem')({ rootValue: 14.8, unitPrecision: 0.1 }),
  // require('postcss-color-rgba-fallback'),
  // require('postcss-font-magician')({
  //   variants: {
  //     Calibri: {
  //       300: [],
  //       400: [],
  //       500: [],
  //       600: [],
  //       700: [],
  //     },
  //   },
  //   foundries: ['google'],
  // }),
]

module.exports = { plugins }
