// * To Type Vuex, see [Vuex + TypeScript](https://dev.to/3vilarthas/vuex-typescript-m4j)
const {VITE_CLOUD_CODE_NAME, VITE_APP_CODE_NAME, VITE_PAGE_CODE_NAME} = import.meta.env;

// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
export const state = {baseQueryUrn: `urn:com:${VITE_CLOUD_CODE_NAME}:${VITE_APP_CODE_NAME}:model:queries:${VITE_PAGE_CODE_NAME}`};

export type State = typeof state;
