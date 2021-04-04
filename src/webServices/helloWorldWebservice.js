// @ts-nocheck

"use strict";

const SUCCESS = 200;
const ERROR = 400;

getData;
function getData (_request, response) {
        response.setStatusCode(SUCCESS);
        response.write(JSON.stringify({message: "Hello World"}));
}
