/* eslint-disable no-inline-comments, sort-imports, no-shadow, symbol-description, require-unicode-regexp */
import axios from "axios";
import loki from "../loki/index";
import {get} from "lodash-es";
import {createLogger, createStore, Store} from "vuex";
import {InjectionKey} from "vue";

type State = {
    loading: boolean;
}

type SelectionTypes = keyof State["selected"];

// define injection key
// See https://next.vuex.vuejs.org/guide/typescript-support.html#typing-usestore-composition-function
export const key: InjectionKey<Store<State>> = Symbol();
const debug = process.env.NODE_ENV !== "production";

export default createStore<State>({
    state: {
        loading: false,
    },
    getters: {
        getField: (state) => (path) => get(state, path),
    },
    mutations: {
        updateField (state, {path, value}) {
            const setStateAtPath = (prev, key, index, array) => {
                if (array.length === index + 1) {
                    // eslint-disable-next-line no-param-reassign
                    prev[key] = value;
                }

                return prev[key];
            };

            if (Array.isArray(path)) {
                path.reduce(setStateAtPath, state);
            } else {
                path.split(/[.[\]]+/).reduce(setStateAtPath, state);
            }
        },
    },
    actions: {
    },
    devtools: debug,
    strict: debug,
    plugins: loggerPlugin(),
});
function loggerPlugin () {
    if (debug) {
        return [createLogger()];
    }

    return [];
}
