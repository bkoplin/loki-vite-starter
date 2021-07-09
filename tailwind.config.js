/* eslint-disable global-require, no-inline-comments, line-comment-position, @typescript-eslint/no-var-requires */
const _ = require('lodash')
const tailwindForms = require('@tailwindcss/forms')
const { fontSize, spacing, lineHeight, animation } = require('tailwindcss/defaultTheme')
const customSpacing = {
  0: '0',
  '1/4': '25%',
  '1/2': '50%',
  '3/4': '75%',
  full: '100%',
}
// for (let cnt = 5; cnt < 100; cnt += 5)
const addPixelSpacing = (cnt) => {
  const key = `px-${cnt}`
  const val = `${cnt}px`

  if (!customSpacing[key]) customSpacing[key] = val
}
const addPctSpacing = (cnt) => {
  const key = `pct-${cnt}`
  const val = `${cnt}%`

  if (!customSpacing[key]) customSpacing[key] = val
}

_.range(1, 101).forEach(addPctSpacing)
_.range(5, 105, 5).forEach(addPixelSpacing)
_.range(50, 1050, 50).forEach(addPixelSpacing)
_.range(1, 51).forEach(addPixelSpacing)
_.range(0, 5.5, 0.5).forEach(addPixelSpacing)

module.exports = {
  important: true,
  purge: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        ...animation
      },
      fontSize: {
        ...fontSize,
        ...{ semilg: '1.1rem' },
        ...{ xxs: '0.625rem' },
      },
      lineHeight: {
        '1.3': '1.333',
        ...lineHeight,
      },
      spacing: {
        128: '32rem',
        144: '36rem',
        ...spacing,
        ...customSpacing,
      },
      borderRadius: { '4xl': '2rem' },
    },
  },
  plugins: [tailwindForms({ strategy: 'class' })],
}
