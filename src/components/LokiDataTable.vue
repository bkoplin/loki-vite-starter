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
import { zipObject, upperCase } from "lodash-es";
import { reactive, inject, onMounted } from 'vue';
import loki from "../loki/index";
import { queryBaseUrn, queryUrl } from '../../urlsAndUrns';

export default {
  setup() {
    console.log(loki);
    const state = reactive({
      columns: [],
      results: [],
    });
    onMounted(async () => {
      let data = await loki.data.query({queryUrn: `${queryBaseUrn}#test`, mapResults: true})
      console.log(data);
      const { columnNames, results }  = data;
      state.columns = columnNames.map((c) => ({ field: c, header: upperCase(c) }));
      state.results = results;
    });

    return state;
  },
};
</script>
