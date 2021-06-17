<template>
  <transition
    name="slide"
    :css="false"
    @leave="slideOut"
  >
    <div
      v-if="show"
      ref="loaderRef"
      class="inset-0 absolute w-full border-r-2"
    >
      <div

        class="flex flex-col h-full items-center justify-center text-center w-full bg-white"
      >
        <font-awesome-icon
          class="fa-spin"
          :icon="['fal', 'cog']"
          size="5x"
        />
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup="props">
import { defineProps, ref, toRefs, watch } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCog as lightCog } from '@fortawesome/pro-light-svg-icons'
import gsap from 'gsap'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(lightCog)

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  icon: {
    type: Array as PropType<string[]>,
    default: ['fa', 'cog'],
  },
})

const { show } = toRefs(props)
const loaderRef = ref()

declare function slideOut (el: Element, done) : void;

const slideOut = (el: HTMLElement, done) => {
  gsap.to(el, {
    x: -1 * el.offsetWidth,
    duration: 0.2,
    delay: 1,
    ease: 'circ.inOut',
    onComplete: done,
  })
}

</script>
