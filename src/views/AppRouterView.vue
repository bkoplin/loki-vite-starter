<template>
  <div class="col-span-10 bg-white rounded relative h-full w-full">
    <router-view
      v-slot="{ Component, route }"
    >
      <transition
        :css="false"
        @enter="enter"
      >
        <keep-alive>
          <component
            :is="Component"
            :key="route.path"
          ></component>
        </keep-alive>
      </transition>
    </router-view>
  </div>
</template>

<script setup lang='ts'>
import { gsap } from 'gsap'
import { useRoute } from 'vue-router'
const route = useRoute()
const enter = (el: gsap.TweenTarget, done: () => void) => gsap.fromTo(
  el,
  { opacity: 0, duration: 0.8, onComplete: done },
  { opacity: 1, top: 0 }
)

</script>