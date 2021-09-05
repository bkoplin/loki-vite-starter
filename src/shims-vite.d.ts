/// <reference types="vite/client" />

export interface EnvKeys {
  VITE_LOKI_USERNAME: string
  VITE_LOKI_PASSWORD: string
  VITE_LOKI_USER_URN: string
  VITE_APP_CODE_NAME_TEST: string
  VITE_CLOUD_CODE_NAME: string
  VITE_APP_CODE_NAME: string
  VITE_PAGE_NAME: string
  VITE_PAGE_CODE_NAME: string
  VITE_PG_DATASPACE: string
}

export interface ImportMeta {
  env: EnvKeys & ImportMeta['env']
}

export type ThisEnv = Required<Pick<NodeJS.ProcessEnv, EnvKeys>>

declare namespace NodeJS {
  export const ProcessEnv = EnvKeys
}
