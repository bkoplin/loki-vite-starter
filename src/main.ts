import { createApp } from 'vue'

import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'

import { store } from '@/store'
import router from '@/router'
import App from '@/App.vue'
import AnimatedNumber from '@/components/AnimatedNumber.vue'
import VueJsonPretty from 'vue-json-pretty'

import 'primeflex/primeflex.css'
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@/style/main.scss'
import 'vue-json-pretty/lib/styles.css'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const app = createApp(App).use(PrimeVue)
  .use(store)
  .use(router)
  .component('font-awesome-icon', FontAwesomeIcon)
  .component('vue-json-pretty', VueJsonPretty)
  .component('animated-number', AnimatedNumber)
  .directive('tooltip', Tooltip)
const vm = app.mount('#app')

export default {
  app,
  vm,
}
