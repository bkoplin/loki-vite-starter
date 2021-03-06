<template>
  <DataTable :value="results" class="p-datatable-sm">
    <Column
      v-for="col of columns"
      :field="col.field"
      :header="col.header"
      :key="col.field"
      :sortable="true"
    ></Column>
</DataTable>

</template>

<script>
// @ts-check
/* eslint-disable no-console */
import { upperCase } from "lodash-es";
import { reactive, onMounted } from 'vue';
import loki from "../loki/index";

const queryBaseUrn = [
  `urn:com`,
  import.meta.env.VITE_CLOUD_CODE_NAME,
  import.meta.env.VITE_APP_CODE_NAME,
  `model:queries`,
  import.meta.env.VITE_PAGE_CODE_NAME,
].join(":");

export default {
  setup() {
    console.log(loki);
    const state = reactive({
      columns: [],
      results: [],
    });
    onMounted(async () => {
      const data = await loki.data.query({ queryUrn: `${queryBaseUrn}#test`, mapResults: true });
      console.log(data);
      const { columnNames, results } = data;
      state.columns = columnNames.map((c) => ({ field: c, header: upperCase(c) }));
      state.results = results;
    });

    return state;
  },
};
</script>
