<template>
  <DataTable :value="results" class="p-datatable-sm">
    <Column
      v-for="col of columns"
      :field="col.field"
      :header="col.header"
      :key="col.field"
      sortable="true"
    ></Column>
</DataTable>

</template>

<script>
// @ts-check
/* eslint-disable no-console */
import "primeicons/primeicons.css";
import "primevue/resources/primevue.min.css";
import "primevue/resources/themes/bootstrap4-light-blue/theme.css";
import axios from 'axios';
import { zipObject, upperCase } from "lodash-es";
import { reactive, inject } from 'vue';
import { queryApiUrl, queryBaseUrn } from '../../urlsAndUrns';

export default {
  setup() {
    const loki = inject('loki');
    console.log(loki);
    let queryUrl = queryApiUrl;
    if (loki) queryUrl = loki.web.getApiServicePrefix() + queryUrl;

    const state = reactive({
      columns: [],
      results: [],
    });
    axios.get(queryUrl, {
      params: { queryUrn: import.meta.env.DEV ? 'urn:com:reedsmith:cobra:data:insights:Q2EELQGJ:components:component1' : `${queryBaseUrn}#test` },
    }).then((d) => {
      console.log(d);
      const { data: { columnNames, results } } = d;
      state.columns = columnNames.map((c) => ({ field: c, header: upperCase(c) }));
      state.results = results.map((r) => zipObject(columnNames, r));
    });

    return state;
  },
};
</script>
