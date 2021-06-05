/* eslint-disable global-require, no-inline-comments, line-comment-position */
const {fontSize, height, minHeight, maxHeight, width, minWidth, maxWidth} = require("tailwindcss/defaultTheme");
const pixelSizes = {
    0: "0",
    "1/4": "25%",
    "1/2": "50%",
    "3/4": "75%",
    full: "100%",
    "px-50": "50px",
    "px-100": "100px",
    "px-150": "150px",
    "px-200": "200px",
    "px-250": "250px",
    "px-300": "300px",
    "px-350": "350px",
    "px-400": "400px",
    "px-450": "450px",
    "px-500": "500px",
    "px-550": "550px",
    "px-600": "600px",
};

module.exports = {
    important: true,
    purge: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            fontSize: {
                ...fontSize,
                ...{semilg: "1.1rem"},
            },
            spacing: {
                128: "32rem",
                144: "36rem",
            },
            borderRadius: {"4xl": "2rem"},
            height: {
                ...height,
                ...pixelSizes,
            },
            minHeight: {
                ...minHeight,
                ...pixelSizes,
            },
            maxHeight: {
                ...maxHeight,
                ...pixelSizes,
            },
            minWidth: {
                ...minWidth,
                ...pixelSizes,
            },
            maxWidth: {
                ...maxWidth,
                ...pixelSizes,
            },
            width: {
                ...width,
                ...pixelSizes,
            },
        },
    },
    variants: {extend: {}},
    plugins: [require("@tailwindcss/forms")({strategy: "class"})],
};
