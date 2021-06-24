<template>
  <span
    v-if="raw && format === '0,0[.]0'"
  >{{ tweeningValue }}</span><span
    v-else
  >{{ textValue }}</span>
</template>

<script setup="props" lang="ts">
import * as Vue from 'vue'
import { computed, defineProps, onMounted, reactive, ref, toRefs, watch } from 'vue'
import gsap from 'gsap'
import numeral from 'numeral'

const props = defineProps({
  value: {
    required: true,
    type: Number,
  },
  format: {
    default: '0,0[.]0',
    type: String,
    required: false,
  },
  raw: {
    default: true,
    type: Boolean,
    required: false,
  },
  duration: {
    default: 1,
    type: Number,
    required: false,
  },
  delay: {
    default: 0,
    type: Number,
    required: false,
  },
  ease: {
    type: String as Vue.PropType<gsap.TweenVars['ease']>,
    required: false,
    default: 'power2.inOut',
  },
})
const { value } = toRefs(props)
const tweeningValue = ref(props.value)
const textValue = computed(() => numeral(Math.floor(tweeningValue.value)).format(props.format))

watch(value, (newValue, oldValue) => {
  gsap.to(
    tweeningValue,
    { value: newValue, duration: props.duration, ease: props.ease, delay: props.delay }
  )
})
</script>
