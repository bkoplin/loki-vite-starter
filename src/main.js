/* eslint-disable no-unused-vars */
import icons from "primeicons/primeicons.css";
import primevueCss from "primevue/resources/primevue.min.css";
import primevueTheme from "primevue/resources/themes/bootstrap4-light-blue/theme.css";

import Column from "primevue/column";
import PrimeVue from "primevue/config";
import DataTable from "primevue/datatable";
import { createApp } from "vue";

import App from "./App.vue";

const app = createApp(App);

app.use(PrimeVue);

app.component('DataTable', DataTable);
app.component('Column', Column);
app.mount('#app');
