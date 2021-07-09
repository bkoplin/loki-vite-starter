<template>
  <app-router-link />
  <app-router-view />
</template>

<script setup lang="ts">
import AppRouterLink from '@/views/AppRouterLink.vue'
import AppRouterView from '@/views/AppRouterView.vue'
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/store'
const store = useStore()
const router = useRouter()
const props = defineProps(['id'])

</script>
