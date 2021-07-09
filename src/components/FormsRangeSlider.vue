<template>
  <!-- see http://ionden.com/a/plugins/ion.rangeSlider/skins.html -->
  <div
    class="
      font-light
      leading-1.6
      text-gray-600
      relative
      text-xs
      h-16
      w-full
      flex flex-row
    "
  >
    <div class="inset-y-0 left-0 w-pct-1 relative">
      <div
        class="absolute bg-gray-300 h-2.5 rounded-l-md mt-1 top-6 w-full"
        :class="
          gsap.utils.snap(step)(rangeValue) >= min
            ? 'bg-blue-500'
            : 'bg-gray-300'
        "
      ></div>
    </div>

    <div
      ref="containerRef"
      class="relative inset-y-0 flex-grow"
    >
      <div
        ref="labelsRef"
        class="h-6 relative"
      >
        <div
          ref="minLabelRef"
          class="
            inline-block
            absolute
            whitespace-nowrap
            py-0.5
            px-1
            my-1
            bg-gray-300
            rounded-sm
            text-xxs
            leading-none
            transform
            -translate-x-pct-50
            left-0
          "
          :class="{ hidden: overlapMin }"
        >
          {{ from_min }}
        </div>
        <!-- <div
          ref="valueLabelRef"
          class="
            inline-block
            absolute
            whitespace-nowrap
            text-white
            py-1
            px-1.5
            leading-none
            bg-blue-500
            rounded
            transform
            -translate-x-pct-50
            z-10
          "
        >
          <span
            class="
              -bottom-1.5
              -ml-0.5
              absolute
              block
              box-border
              h-1
              left-1/2
              overflow-hidden
              w-1
            "
            style="border: 3px solid transparent"
            :style="{ borderTopColor: colors.blue['500'] }"
          >&nbsp;</span>
          {{ valueText }}
        </div> -->
        <div
          ref="maxLabelRef"
          class="
            inline-block
            absolute
            whitespace-nowrap
            py-0.5
            px-1
            my-1
            bg-gray-300
            rounded-sm
            text-xxs
            leading-none
            transform
            translate-x-pct-50
            right-0
          "
          :class="{ hidden: overlapMax }"
        >
          {{ from_max }}
        </div>
      </div>
      <div
        class="relative bg-gray-300 h-2.5 mt-1 w-full"
      >
        <div
          ref="valueBarRef"
          class="inset-y-0 bg-blue-500 left-0 h-full"
          style="width:0%;"
        ></div>
        <div
          ref="handleRef"
          class="-bottom-1 -ml-px -top-1 absolute overflow-visible w-0"
        >
          <div
            ref="valueLabelRef"
            class="
            inline-block
            absolute
            whitespace-nowrap
            text-white
            py-1
            px-1.5
            leading-none
            bg-blue-500
            rounded
            transform
            -translate-x-pct-50
            -top-6
            z-10
          "
          >
            <span
              class="
              -bottom-1.5
              -ml-0.5
              absolute
              block
              box-border
              h-1
              left-1/2
              overflow-hidden
              w-1
            "
              style="border: 3px solid transparent"
              :style="{ borderTopColor: colors.blue['500'] }"
            >&nbsp;</span>
            {{ valueText }}
          </div>
          <div class="bg-blue-500 h-full w-px-2"></div>
        </div>
      </div>
      <div class="relative mt-1.5 w-full h-5">
        <div
          v-for="tick in majorTicks"
          :key="tick.left"
          class="absolute top-0 w-px h-2 bg-gray-400"
          :style="{ left: tick.left }"
        ></div>
        <div
          v-for="tick in minorTicks"
          :key="tick.left"
          class="absolute top-0 w-px h-1 bg-gray-400"
          :style="{ left: tick.left }"
        ></div>
        <div
          v-for="(tick, i) in majorTicks"
          :key="tick.left"
          class="
            absolute
            bottom-0
            h-2
            text-xxs
            leading-none
            py-0.5
            px-1
            text-gray-700
            transform
            -translate-x-1/2
          "
          :style="{ left: tick.left }"
        >
          {{ tick.label }}
        </div>
        <div
          ref="validRangeRef"
          class="absolute inset-y-0"
        >
          <div class="inset-0 absolute h-px bg-gray-400"></div>
        </div>
      </div>
    </div>
    <div class="inset-y-0 right-0 w-pct-1 relative">
      <div
        class="absolute h-2.5 rounded-r-md mt-1 top-6 w-full"
        :class="
          gsap.utils.snap(step)(rangeValue) === max
            ? 'bg-blue-500'
            : 'bg-gray-300'
        "
      ></div>
    </div>
    <div
      v-if="disabled"
      class="bg-opacity-30 bg-white inset-0 absolute z-50"
    ></div>
  <!-- <vue-json-pretty :data="containerCss"></vue-json-pretty> -->
  </div>
</template>

<script setup lang="ts">
import {
  get,
  reactify, reactifyObject, set, useCssVar,
  useElementBounding, useVModel
} from '@vueuse/core'
import { gsap } from 'gsap'
import Draggable from 'gsap/Draggable'
import { times } from 'lodash-es'
import colors from 'tailwindcss/colors'
import {
  computed,
  defineEmit,
  defineProps,
  reactive,
  ref,
  toRefs,
  watch,
  watchEffect
} from 'vue'
const U = reactifyObject(gsap.utils)

gsap.registerPlugin(Draggable)

const props = defineProps({
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
  from: {
    type: Number,
    // according to the ionrageslider code, the left percentage is the total percentage plus half the handleRef coordinates minus half the label coordinates https://github.com/IonDen/ion.rangeSlider/blob/225df919fdc3203dc40f513488f93ad847af1d2e/js/ion.rangeSlider.js#L1295
    default: 51,
  },
  from_min: {
    type: Number,
    default: 0,
  },
  from_max: {
    type: Number,
    default: 66,
  },
  step: {
    type: Number,
    default: 1,
  },
  grid_num: {
    type: Number,
    default: 5,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})
const { min, max, from, from_min, from_max, step, grid_num, disabled }
  = toRefs(props)
const emit = defineEmit()
const rangeValue = useVModel(
  props,
  'from',
  emit,
  { passive: true }
)

/*
Refs:
  - containerRef: contains everything. sets min and max bounds. scaled against props.min and props.max
  - labelsRef: Contains the from_min and from_max, value labels. Sized by its parent container, containerRef
  - valueLabelRef: Contains the value label. Moves with the handle. ONLY USED TO DETECT LABEL COLLISIONS
  - valueBarRef: used to paint the blue bar. width corresponds with scaled prop.from
*/
const timeline = gsap.timeline()
const containerRef = ref()
const labelsRef = ref()
const valueBarRef = ref()
const valueLabelRef = ref()
const { width: valueLabelWidth } = useElementBounding(valueLabelRef)
const handleRef = ref()
const validRangeRef = ref()
const minLabelRef = ref()
const maxLabelRef = ref()
const overlapMin = ref(false)
const overlapMax = ref(false)
const labelsCss = reactive({
  left: useCssVar(
    'left',
    labelsRef
  ),
  width: useCssVar(
    'width',
    labelsRef
  ),
})
const valueBarWidth = useCssVar(
  'width',
  valueBarRef
)
const validRangeCss = reactive({
  left: useCssVar(
    'left',
    validRangeRef
  ),
  width: useCssVar(
    'width',
    validRangeRef
  ),
})
const { width: containerWidth, left: containerLeft } = useElementBounding(containerRef)
const { width: validRangeWidth, left: validRangeLeft } = useElementBounding(validRangeRef)
const valueText = computed(() => gsap.utils.snap(
  step.value,
  rangeValue.value
))
const minMaxContainerScale = U.mapRange(
  min,
  max,
  containerLeft,
  containerWidth
)
const snapper = computed(() => minMaxContainerScale.value(step.value))
const handleTween = reactify((target, scale, val) => gsap.to(
  target,
  { x: scale(val) }
))(
  handleRef,
  minMaxContainerScale,
  from
)

watch(
  minMaxContainerScale,
  (scale) => {
    const mapper = gsap.utils.unitize(
      scale,
      'px'
    )

    valueBarWidth.value = mapper(rangeValue.value)
    validRangeCss.left = mapper(from_min.value)
    validRangeCss.width = mapper(from_max.value - from_min.value)
    labelsCss.left = mapper(from_min.value)
    labelsCss.width = mapper(from_max.value - from_min.value)
    const draggable = new Draggable(
      handleRef.value,
      {
        type: 'x',
        bounds: validRangeRef.value,
        lockAxis: true,
        transformOrigin: 'left',
        minimumMovement: 6,
        trigger: containerRef.value,
        liveSnap(val) {

          const snapped = gsap.utils.snap(
            snapper.value,
            val
          )

          return snapped
        },
        onDragEnd() {
          handleRef.value.style.zIndex = 10
        },
        onDrag() {
          const mapper = gsap.utils.pipe(
            gsap.utils.mapRange(
              this.minX,
              this.maxX,
              from_min.value,
              from_max.value
            ),
            gsap.utils.clamp(
              from_min.value,
              from_max.value
            )
          )
          const snappedValue = gsap.utils.snap(
            step.value,
            mapper(this.x)
          )

          overlapMin.value = this.x < this.minX + valueLabelWidth.value + 6
          overlapMax.value = this.x > this.maxX - valueLabelWidth.value - 6
          if (get(rangeValue) !== snappedValue) {
            set(
              rangeValue,
              snappedValue
            )
          }

        },
      }
    )
  },
  { flush: 'post' }
)
// watchEffect(
//   () => {
//     const mapper = gsap.utils.unitize(
//       get(minMaxContainerScale),
//       'px'
//     )

//     set(
//       valueBarWidth,
//       mapper(rangeValue.value)
//     )
//   },
//   { flush: 'post' }
//   // valueBarTween.value.to({ width: mapper(v) })

//   // valueBarCss.width = mapper(v) < 0
//   //   ? '0px'
//   //   : gsap.utils.unitize(
//   //     mapper,
//   //     'px'
//   //   )(v)
// )
const majorTicks = computed(() => times(
  grid_num.value,
  i => gsap.utils.pipe(
    gsap.utils.normalize(
      1,
      grid_num.value
    ),
    gsap.utils.interpolate(
      { left: '0%', label: min.value },
      { left: '100%', label: max.value }
    )
  )(i + 1)
))
const minorTicks = computed(() => times(
  grid_num.value * 4,
  i => gsap.utils.pipe(
    gsap.utils.normalize(
      1,
      grid_num.value * 4 + 1
    ),
    gsap.utils.interpolate(
      { left: '0%', label: min.value },
      { left: '100%', label: max.value }
    )
  )(i + 1)
))

</script>
