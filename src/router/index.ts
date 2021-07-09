import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const baseUrl = `https://${import.meta.env.VITE_CLOUD_CODE_NAME}.saplingdata.com/`
const pageBaseUrl = `${import.meta.env.VITE_APP_CODE_NAME_TEST}/pages/urn/com/${import.meta.env.VITE_CLOUD_CODE_NAME}/${import.meta.env.VITE_APP_CODE_NAME}/app/pages/${import.meta.env.VITE_PAGE_CODE_NAME}/v`

export const insightWallUrl = `${baseUrl}${import.meta.env.VITE_APP_CODE_NAME_TEST}/pages/urn/com/saplingdata/caseMaker/app/pages/insightWall/v/`

const routes: RouteRecordRaw[] = []

const router = createRouter({
  history: import.meta.env.DEV ? createWebHistory() : createWebHistory(pageBaseUrl),
  routes,
})

export default router
