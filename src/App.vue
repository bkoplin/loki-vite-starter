<template>
  <hello-world />
  <FontAwesomeLoader
  :fa-props="{size: '3x'}"
  ></FontAwesomeLoader>
</template>

<script setup lang="ts">
import VueJsonPretty from "vue-json-pretty";
import HelloWorld from "@/components/HelloWorld.vue";
import FontAwesomeLoader from "@/components/FontAwesomeLoader.vue";
import { useStore } from "@/store";
import {
  computed,
  onMounted,
  reactive,
  ref,
  toRaw,
} from "vue";

const store = useStore();
const state = computed(() => store.state);
const getters = computed(() => store.getters);
</script>
