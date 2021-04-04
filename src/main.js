/* eslint-disable sort-imports */

// console.log(import.meta.env);
import {createApp} from "vue";

import App from "./components/App.vue";
import store, {key} from "./store/index.ts";

import "./style/main.css";
import "./style/_overrides.scss";
import "primeflex/primeflex.css";
import "primevue/resources/themes/bootstrap4-light-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

import PrimeVue from "primevue/config";

const app = createApp(App);

app.use(PrimeVue);
app.use(store, key);
const vm = app.mount("#app");

export default {
    app,
    vm,
};
