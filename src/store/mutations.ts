// * To Type Vuex, see [Vuex + TypeScript](https://dev.to/3vilarthas/vuex-typescript-m4j)
import { ActionTypes } from "@/store/actions";
import {State} from "@/store/state";
import {isEqual, uniqWith} from "lodash";
import {MutationTree} from "vuex";

export enum MutationTypes {
    UPDATE_STATE = "UPDATE_STATE"
}

export type Mutations = {
    [MutationTypes.UPDATE_STATE](
        state: State,
        payload: { path: string; value: any; append?: boolean; }
    ): void;
};

export const mutations : Mutations & MutationTree<State> = {
    [MutationTypes.UPDATE_STATE]: (state, {path, value, append = false}) => {
        path.split(/[.[\]]+/u).reduce((prev: State & {[x:string]: any}, key, index, array) => {
            // eslint-disable-next-line no-magic-numbers
            if (index === array.length - 1) {
                if (append === true) {
                    const currStateVal = prev[key];

                    if (Array.isArray(currStateVal)) {
                        prev[key] = uniqWith([
                            ...currStateVal,
                            ...value,
                        ], isEqual);
                    } else if (typeof currStateVal === "object") {
                        prev[key] = {
                            ...currStateVal,
                            ...value,
                        };
                    } else {
                        prev[key] = value;
                    }
                } else {
                    // eslint-disable-next-line no-param-reassign
                    prev[key] = value;
                }
            }

            return prev[key];
        }, state);
    },
};
