<template>
  <div class="w-full h-full">
    <div class="text-red-500 text-xl font-light align-middle text-center">
      Hello World
    </div>
    <div class="font-light text-xl text-green-700">BROWSER LOCATION</div>
    <vue-json-pretty
      class="w-full m-2"
      :data="location"
    ></vue-json-pretty>
  </div>
</template>

<script setup lang='ts'>
import { computed, defineEmit, defineProps, reactive, ref, toRef, toRefs, watch, watchEffect } from 'vue'
import type { Component, EmitsOptions, PropType, Ref } from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import { useBrowserLocation } from '@vueuse/core'

const location = useBrowserLocation()

</script>
