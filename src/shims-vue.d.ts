declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>

  export interface GlobalComponents {
    RouterLink: typeof import('vue-router')['RouterLink']
    RouterView: typeof import('vue-router')['RouterView']
  }
  export default component
}

declare module '@j-t-mcc/vue3-chartjs' {
  import { Chart } from 'chart.js'
  import Vue3ChartJs from './Vue3ChartJs.vue'

  Vue3ChartJs.registerGlobalPlugins = (plugins) => {
    Chart.register(...plugins)
  }

  Vue3ChartJs.install = (app, options = {}) => {
    app.component(
      Vue3ChartJs.name,
      Vue3ChartJs
    )

    if (options?.plugins?.length) Vue3ChartJs.registerGlobalPlugins(options.plugins)

  }

  export default Vue3ChartJs
}
