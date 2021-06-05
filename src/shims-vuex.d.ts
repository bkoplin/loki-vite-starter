/* eslint-disable */
// path to store file
import {Store} from "@/store";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $store: Store;
  }
}