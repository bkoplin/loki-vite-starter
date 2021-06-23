<template>
  <transition
    name="slide"
    :css="false"
    @after-enter="animateIn"
    @leave="animateOut"
  >
    <div v-show="show" ref="thisRef" class="inset-0 absolute">
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
          :icon="lightCog"
          ref="iconRef"
          :spin="spin"
          :size="'3x'"
        ></font-awesome-icon>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import Vue, {
  defineProps,
  defineEmit,
  ref,
  toRefs,
  toRaw,
  watch,
  watchEffect,
  reactive,
  computed,
} from "vue";
import * as FA from "@fortawesome/fontawesome-svg-core";
import * as FAV from "@fortawesome/vue-fontawesome";
import { gsap } from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

import {
  faCog as lightCog,
  faCheckCircle as lightCheckCircle,
} from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
gsap.registerPlugin(MorphSVGPlugin);
type Icon = ReturnType<typeof FA.icon>;

type IconAttributes = {
  d: gsap.SVGPathValue;
  fill: "currentColor";
};

type AbstractIcon = {
  children: {
    attributes: IconAttributes;
    tag: "path";
  }[];
  tag: "svg";
  attributes: Icon["abstract"][0]["attributes"];
}[];

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  id: {
    type: String,
    required: false,
    default: 'loader'
  },
  iconProps: {
    type: Object as Vue.PropType<FAV.FontAwesomeIconProps>,
  },
  iconSize: {
    type: String as Vue.PropType<'xs'|'sm'|'lg'|'2x'|'3x'|'5x'|'7x'|'10x'>,
    required: false,
    default: '3x',
    validator: (val : string) => [
        'xs'
        , 'sm'
        , 'lg'
        , '2x'
        , '3x'
        , '5x'
        , '7x'
        , '10x'
      ].includes(val)
  },
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
    default: "power2.inOut",
  },
  endState: {
    default: { opacity: 0 },
  },
});

const emit = defineEmit({ done: () => true });
const thisRef = ref();
const { show } = toRefs(props);
const spin = ref(show.value);
const cogAbstract = FA.icon(lightCog).abstract;
const checkCircleAbstract = FA.icon(lightCheckCircle).abstract;
const iconRef = ref();
const fromIcon = getPathData(cogAbstract)?.d;
const toIcon = getPathData(checkCircleAbstract)?.d;
const tl = gsap.timeline({
  defaults: {
    duration: props.duration,
    ease: props.ease,
    // delay: props.delay,
  },
  paused: true,
  id: props.id
});


watchEffect(
  () => {
    const iconEl = iconRef.value.$el;
    const componentEl = thisRef.value
    // console.log({iconRef: iconRef.value.$el, thisRef: toRaw(thisRef.value)})
    tl.to(gsap.utils.selector(iconEl)('path'), {
      morphSVG: toIcon,
      id: `${props.id}_morph`,
    })
      .to(componentEl, {
        delay: 0.25,
        id: `${props.id}_fade`,
        ...props.endState,
      });
  },
  { flush: "post" } // See https://v3.vuejs.org/guide/composition-api-template-refs.html#watching-template-refs for meaning
);
function animateOut(el: Element, done: () => void) {
  spin.value = false;
  tl.delay(props.delay).play().then(done);
}
function animateIn(el: Element) {
  spin.value = false;
  tl.delay(props.delay).reverse().then(() => spin.value = true)
}

function getPathData(arg: Icon | AbstractIcon | FA.AbstractElement[]): {
  d: gsap.SVGPathValue;
} {
  if (hasPathdata(arg)) return arg[0].children[0].attributes;
  else return { d: "" };
}

function hasPathdata(
  arg: Icon | AbstractIcon | FA.AbstractElement[]
): arg is AbstractIcon {
  return (arg as AbstractIcon)[0]?.children[0]?.attributes?.d !== undefined;
}
</script>
