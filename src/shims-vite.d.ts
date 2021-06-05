/// <reference types="vite/client" />

export enum EnvKeys {
    LOKI_USERNAME = "LOKI_USERNAME",
    LOKI_PASSWORD = "LOKI_PASSWORD",
    LOKI_USER_URN = "LOKI_USER_URN",
    VITE_APP_CODE_NAME_TEST = "VITE_APP_CODE_NAME_TEST",
    VITE_CLOUD_CODE_NAME = "VITE_CLOUD_CODE_NAME",
    VITE_APP_CODE_NAME = "VITE_APP_CODE_NAME",
    VITE_PAGE_NAME = "VITE_PAGE_NAME",
    VITE_PAGE_CODE_NAME = "VITE_PAGE_CODE_NAME",
    VITE_PG_DATASPACE = "VITE_PG_DATASPACE",
}

interface ImportMeta {
    [K in EnvKeys]: string;
}

export type ThisEnv = Required<Pick<NodeJS.ProcessEnv, EnvKeys>>;

declare namespace NodeJS {
    export const ProcessEnv = EnvKeys;
}
