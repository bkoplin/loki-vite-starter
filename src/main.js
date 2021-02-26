import "primeicons/primeicons.css";
import "primevue/resources/primevue.min.css";
import "primevue/resources/themes/bootstrap4-light-blue/theme.css";

import Column from "primevue/column";
import PrimeVue from "primevue/config";
import DataTable from "primevue/datatable";
import TreeTable from "primevue/treetable";
import { createApp } from "vue";

import App from "./App.vue";

const app = createApp(App);

app.use(PrimeVue);

app.component('DataTable', DataTable);
app.component('TreeTable', TreeTable);
app.component('Column', Column);
app.mount('#app');
