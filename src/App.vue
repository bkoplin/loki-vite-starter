<template>
  <hello-world />
</template>

<script lang="ts">
import HelloWorld from "@/components/HelloWorld.vue";
import {useStore} from "@/store";
import {computed, defineComponent, onMounted, reactive, ref, toRaw} from "vue";

export default defineComponent({
    name: "App",
    components: {HelloWorld},
    setup (props) {
        const store = useStore();
        const state = computed(() => store.state);
        const getters = computed(() => store.getters);

        return {
            state,
            getters,
        };
    },
});

</script>
