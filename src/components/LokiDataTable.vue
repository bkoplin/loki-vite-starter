<template>
  <TreeTable :value="results">
    <Column
      v-for="col of columns"
      :field="col.field"
      :header="col.header"
      :key="col.field"
    ></Column>
</TreeTable>

</template>

<script>
// @ts-check
import axios from 'axios';
import { zipObject, upperCase } from "lodash-es";
import { reactive } from 'vue';

export default {
  setup() {
    const state = reactive({
      columns: [],
      results: [],
    });
    if (import.meta.env.DEV) {
      axios.get('/query', {
        params: { queryUrn: 'urn:com:reedsmith:cobra:data:insights:Q2EELQGJ:components:component1' },
        auth: { username: 'bkoplin', password: 'meat shifty hunker 1' },
      }).then((d) => {
        console.log(d);
        const { data: { columnNames, results } } = d;
        state.columns = columnNames.map((c) => ({ field: c, header: upperCase(c) }));
        state.results = results.map((r) => zipObject(columnNames, r));
      });
    } else {
      axios.get("https://reedsmith.saplingdata.com/cobra/api/urn/com/loki/core/model/api/query/v/", {
        params: { queryUrn: 'urn:com:reedsmith:cobra:data:insights:Q2EELQGJ:components:component1' },
      }).then((d) => {
        console.log(d);
        const { data: { columnNames, results } } = d;
        state.columns = columnNames.map((c) => ({ field: c, header: upperCase(c) }));
        state.results = results.map((r) => zipObject(columnNames, r));
      });
    }

    return state;
  },
};
</script>