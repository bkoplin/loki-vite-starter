/* eslint-disable global-require */
const {fontSize} = require("tailwindcss/defaultTheme");

module.exports = {
    important: "#app",
    purge: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            fontSize: {
                ...fontSize,
                ...{base: "0.875rem"},
            },
            spacing: {
                128: "32rem",
                144: "36rem",
            },
            borderRadius: {"4xl": "2rem"},
        },
    },
    variants: {extend: {}},
    plugins: [require("@tailwindcss/typography")],
};
