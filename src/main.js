import "primeicons/primeicons.css";
import "primevue/resources/primevue.min.css";
import "primevue/resources/themes/bootstrap4-light-blue/theme.css";
import { createApp } from "vue";
import App from "./App.vue";

const app = createApp(App);
const vm = app.mount('#app');

export default { app, vm };
