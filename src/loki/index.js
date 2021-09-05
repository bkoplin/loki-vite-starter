/// <reference types="vite/client" />

import Loki from '../../node_modules/@sapling-data/loki-javascript-client'

export default new Loki({
  baseUrl: `https://${import.meta.env.VITE_CLOUD_CODE_NAME}.saplingdata.com`,
  appName: import.meta.env.VITE_APP_CODE_NAME_TEST,
  auth: {
    username: import.meta.env.VITE_LOKI_USERNAME,
    password: import.meta.env.VITE_LOKI_PASSWORD,
  },
})
