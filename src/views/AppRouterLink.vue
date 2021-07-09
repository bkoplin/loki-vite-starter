<template>
  <nav class="content-start col-span-2 flex flex-row flex-wrap h-full relative">
    <router-link :to="{name: 'home'}"></router-link>
    <a
      class="
        py-2
        px-3
        w-full
        no-underline
        text-blue-600
        flex flex-row
        items-baseline
        gap-1
        bottom-0
        absolute
      "
      :href="insightWallUrl"
      target="_blank"
    >
      <span>INSIGHT WALL</span>
      <font-awesome-icon
        fixed
        :icon="faExternalLink"
        size="xs"
      ></font-awesome-icon>
    </a>
  </nav>
</template>

<script setup lang='ts'>
import { useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faExternalLink } from '@fortawesome/pro-duotone-svg-icons'
import { insightWallUrl } from '@/router'
const router = useRouter()

</script>

<style lang="scss">
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

a {
  @apply text-gray-900;
}

.router-link-active,
.router-router-link-exact-active {
  @apply bg-blue-400 text-white hover:text-white;
}
</style>
