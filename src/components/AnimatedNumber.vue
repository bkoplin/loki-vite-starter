<template>
  <span v-if="raw">{{ tweeningValue }}</span><span v-else>{{ textValue }}</span>
</template>

<script setup="props" lang="ts">
import { watch, defineProps, computed, onMounted, toRefs, ref, reactive } from 'vue'
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
  },
  raw: {
    default: true,
    type: Boolean,
  },
  duration: {
    default: 1,
    type: Number,
  },
  delay: {
    default: 0,
    type: Number,
  },
  ease: {
    default: 'circ.inOut',
    type: String as PropType<gsap.EaseFunction | string>,
  },
})

const { value } = toRefs(props)

const tweeningValue = ref(props.value)
const textValue = computed(() =>
  numeral(Math.floor(tweeningValue.value)).format(props.format),
)

watch(value, (newValue, oldValue) => {
  gsap.to(
    tweeningValue,
    { value: newValue, duration: props.duration, ease: props.ease, delay: props.delay },
  )
})
</script>
