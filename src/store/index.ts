// * To Type Vuex, see [Vuex + TypeScript](https://dev.to/3vilarthas/vuex-typescript-m4j)
/* eslint-disable no-ternary */

import loki from "@/loki";
import {State, state} from "@/store/state";
import {Actions, actions} from "@/store/actions";
import {Mutations, mutations} from "@/store/mutations";
import {Getters, GetterReturnTypes, getters} from "@/store/getters";
import {CommitOptions, DispatchOptions, Store as VuexStore, createLogger, createStore} from "vuex";

const debug = import.meta.env.DEV;

export const store = createStore({
    state,
    getters,
    actions,
    mutations,
    strict: debug,
    plugins: debug
        ? [createLogger()]
        : [],
});

// eslint-disable-next-line no-magic-numbers
type ActionsPayloads = { [K in keyof Actions]: Parameters<Actions[K]>[1] }

// eslint-disable-next-line no-magic-numbers
type MutationsPayloads = { [K in keyof Mutations]: Parameters<Mutations[K]>[1] }

type Commit = {
    commit<K extends keyof Mutations = keyof Mutations>(key: K, payload: MutationsPayloads[K], options?: CommitOptions): ReturnType<Mutations[K]>;
};

type Dispatch = {
    dispatch<K extends keyof ActionsPayloads = keyof ActionsPayloads>(key: K, payload: ActionsPayloads[K], options?: DispatchOptions): ReturnType<Actions[K]>;
};

export type Store<S = State> = Omit<
    VuexStore<S>,
    "getters" | "commit" | "dispatch"
> & Commit & Dispatch & {getters: GetterReturnTypes};

export function useStore () {
    return store as Store<State>;
}

