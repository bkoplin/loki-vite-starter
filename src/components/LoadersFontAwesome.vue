<template>
  <transition
    name="slide"
    :css="false"
    @after-enter="animateIn"
    @leave="animateOut"
  >
    <div
      v-show="show"
      ref="thisRef"
      class="inset-0 absolute"
    >
      <div
        class="
          flex flex-col
          h-full
          items-center
          justify-center
          text-center
          w-full
        "
      >
        <font-awesome-icon
          ref="iconRef"
          :icon="fromIconDef"
          :spin="spin"
          v-bind="faProps"
        ></font-awesome-icon>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import * as Vue from 'vue'
import * as FA from '@fortawesome/fontawesome-svg-core'
import * as FAV from '@fortawesome/vue-fontawesome'
import {
  computed,
  defineEmit,
  defineProps,
  reactive,
  ref,
  toRaw,
  toRefs,
  watch,
  watchEffect
} from 'vue'
import { gsap } from 'gsap'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'

import {
  faCog as fromIconDef,
  faCheckCircle as toIconDef
} from '@fortawesome/pro-light-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
gsap.registerPlugin(MorphSVGPlugin)
type Icon = ReturnType<typeof FA.icon>

type IconAttributes = {
  d: gsap.SVGPathValue
  fill: 'currentColor'
}

type AbstractIcon = {
  children: {
    attributes: IconAttributes
    tag: 'path'
  }[]
  tag: 'svg'
  attributes: Icon['abstract'][0]['attributes']
}[]

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  id: {
    type: String,
    required: false,
    default: 'loader',
  },
  faProps: { default: { size: '3x' }, type: Object as Vue.PropType<Partial<Omit<typeof FontAwesomeIcon.$props, 'icon'|'size'>> & Pick<typeof FontAwesomeIcon.$props, 'size'>> },
  duration: {
    default: 0.25,
    type: Number,
    required: false,
  },
  delay: {
    default: 0.5,
    type: Number,
    required: false,
  },
  ease: {
    type: String,
    required: false,
    default: 'power2.inOut',
  },
  endState: {
    type: Object as Vue.PropType<Partial<gsap.CSSProperties>>,
    default: { opacity: 0 },
  },
})
const emit = defineEmit({ done: () => true })
const thisRef = ref()
const { show } = toRefs(props)
const spin = ref(show.value)
const fromIconAbstract = FA.icon(fromIconDef).abstract
const toIconAbstract = FA.icon(toIconDef).abstract
const iconRef = ref()
const fromIcon = getPathData(fromIconAbstract)?.d
const toIcon = getPathData(toIconAbstract)?.d
const tl = gsap.timeline({
  defaults: {
    duration: props.duration,
    ease: props.ease,
    // delay: props.delay,
  },
  paused: true,
  id: props.id,
})

watchEffect(
  () => {
    const iconEl = iconRef.value.$el
    const componentEl = thisRef.value

    tl.to(gsap.utils.selector(iconEl)('path'), {
      morphSVG: toIcon,
      id: `${props.id}_morph`,
    }).to(componentEl, {
      delay: 0.25,
      id: `${props.id}_fade`,
      ...props.endState,
    })
  },
  // * See https://v3.vuejs.org/guide/composition-api-template-refs.html#watching-template-refs
  // * for meaning of "flush" parameter
  { flush: 'post' }
)
function animateOut(_el: Element, done: () => void) {
  spin.value = false
  tl.delay(props.delay).play()
    .then(done)
}
function animateIn(_el: Element) {
  spin.value = false
  tl.delay(props.delay)
    .reverse()
    .then(() => (spin.value = true))
}

function getPathData(arg: Icon | AbstractIcon | FA.AbstractElement[]): {
  d: gsap.SVGPathValue
} {
  if (hasPathdata(arg)) return arg[0].children[0].attributes

  return { d: '' }
}

function hasPathdata(arg: Icon | AbstractIcon | FA.AbstractElement[]): arg is AbstractIcon {
  return (arg as AbstractIcon)[0]?.children[0]?.attributes?.d !== undefined
}
</script>
