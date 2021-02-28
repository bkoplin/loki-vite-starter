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
import axios from "axios";
import { zipObject, upperCase } from "lodash-es";
import { reactive, inject, onMounted } from 'vue';
import { queryBaseUrn, queryUrl } from '../../urlsAndUrns';

export default {
  setup() {
    const loki = inject('loki');
    console.log(loki);
    const state = reactive({
      columns: [],
      results: [],
    });
    onMounted(async () => {
      let d;
      if (import.meta.env.DEV) {
        d = await axios.get(queryUrl, {
          params: {queryUrn: 'urn:com:reedsmith:cobra:data:insights:Q2EELQGJ:components:component1'},
        });
      } else d = { data: await loki.data.query({ queryUrn: `${queryBaseUrn}#test` }) };
      console.log(d);
      const { data: { columnNames, results } } = d;
      state.columns = columnNames.map((c) => ({ field: c, header: upperCase(c) }));
      state.results = results.map((r) => zipObject(columnNames, r));
    });

    return state;
  },
};
</script>
