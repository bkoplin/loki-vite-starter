<template>
    <VueJsonPretty :data="state"/>
    <hello-world></hello-world>
</template>

<script lang="ts">
import VueJsonPretty from "vue-json-pretty";
import HelloWorld from "@/components/HelloWorld.vue";
import {useStore} from "@/store";
import {computed, defineComponent, onMounted, reactive, ref, toRaw} from "vue";

export default defineComponent({
    name: "App",
    components: {VueJsonPretty, HelloWorld},
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
