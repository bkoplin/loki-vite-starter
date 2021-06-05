// * To Type Vuex, see [Vuex + TypeScript](https://dev.to/3vilarthas/vuex-typescript-m4j)
import {QueryOptions} from "@/loki";
import {State} from "@/store/state";
import { GetterTree } from "vuex";

export enum GetterTypes {
    EXAMPLE_GETTER= "baseQueryUrn"
}

export const getters: Getters & GetterTree<State, State> = {[GetterTypes.EXAMPLE_GETTER]: (state) => state.baseQueryUrn};

export type Getters<S = State> = {
    [GetterTypes.EXAMPLE_GETTER](state: S): string;
};

export type GetterReturnTypes = {
    [K in keyof Getters]: ReturnType<Getters[K]>;
};

