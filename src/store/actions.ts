// * To Type Vuex, see [Vuex + TypeScript](https://dev.to/3vilarthas/vuex-typescript-m4j)
import {ActionContext, ActionTree} from "vuex";
import loki, {QueryOptions} from "@/loki";
import {GetterTypes, Getters} from "@/store/getters";
import {MutationTypes, Mutations} from "@/store/mutations";
import {State} from "@/store/state";

export enum ActionTypes {
    GENERIC_QUERY_AND_LOAD = "GENERIC_QUERY_AND_LOAD"
}

export const actions: Actions & ActionTree<State, State> = {
    [ActionTypes.GENERIC_QUERY_AND_LOAD]: async (
        {commit},
        {opts, path, append = false}
    ) => {
        if (opts?.mapResults !== true) {
            opts.mapResults = true;
        }
        const {results: value} = await loki.data.query<any>(opts);

        commit(MutationTypes.UPDATE_STATE, {
            path,
            value,
            append,
        });
    },
};

export type Actions = {
    [ActionTypes.GENERIC_QUERY_AND_LOAD](
        ctx: AugmentedActionContext,
        payload: {
            opts: Omit<QueryOptions, "query">;
            path: string;
            append?: boolean;
        }
    ): Promise<void>;
};

export type AugmentedActionContext = {
    commit<K extends keyof Mutations>(
        key: K,
        payload: Parameters<Mutations[K]>[1]
    ): ReturnType<Mutations[K]>;
    getters: {
        [K in keyof Getters]: ReturnType<Getters[K]>;
    };
} & Omit<ActionContext<State, State>, "commit" | "getters">;
