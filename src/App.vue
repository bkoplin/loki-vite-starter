<template>
  <div class="w-full m-4 grid gap-4">
    <div class="col-start-1 col-end-5">
      <div class="btn-group btn-group-sm w-full">
        <div
          class="btn btn-outline-primary w-1/2"
          @click="toggleShow"
        >
          {{ show ? 'HIDE' : 'SHOW' }}
        </div>
        <div
          class="btn btn-outline-secondary w-1/2"
          :class="{disabled: show}"
          :disabled="show"
          @click="randomNum"
        >
          RANDOMIZE
        </div>
      </div>
    </div>
    <div class="w-full relative h-px-450 col-span-4">
      <animated-number
        :value="number"
        :format="'0,0'"
      ></animated-number>
      <font-awesome-loader
        :show="show"
        :fa-props="{size: '6x'}"
      ></font-awesome-loader>
    </div>
  </div>
</template>

<script setup lang="ts">
import VueJsonPretty from 'vue-json-pretty'
import FontAwesomeLoader from '@/components/FontAwesomeLoader.vue'
import { useStore } from '@/store'
import {
  computed,
  onMounted,
  reactive,
  ref,
  toRaw
} from 'vue'
import AnimatedNumber from './components/AnimatedNumber.vue'

const store = useStore()
const state = computed(() => store.state)
const getters = computed(() => store.getters)
const show = ref(true)
const number = ref(0)
const toggleShow = () => show.value = !show.value
const randomNum = () => number.value = Math.random() * 100000

</script>
