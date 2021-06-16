import {createApp} from "vue";

import App from "./App.vue";

import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";

import {store} from "@/store";

import "primeflex/primeflex.css";
import "primevue/resources/themes/bootstrap4-light-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import "@/style/main.css";

const app = createApp(App);

app.use(PrimeVue);
app.use(store);
app.directive("tooltip", Tooltip);

const vm = app.mount("#app");

export default {
    app,
    vm,
};