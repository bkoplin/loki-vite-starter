<template>
  <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
    <HelloWorld msg="Welcome to your Loki Vue 3 + Vite Starter!" />
    <button class="inline-flex items-center px-2.5 py-1.5 mt-3 border
      border-transparent text-xs font-medium rounded shadow-sm text-white
      bg-indigo-600 hover:bg-indigo-700
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        @click="tailwindCheck">If this button is purple, you're riding the Tailwind!</button>
  </div>
</template>

<script>
import { provide } from "vue";

export default {
  setup() {
    provide('loki', window.loki);
    // eslint-disable-next-line no-unused-vars
    const tailwindCheck = () => {
      // eslint-disable-next-line no-alert
      alert('Yay Tailwind!');
    };
  },
};
</script>

