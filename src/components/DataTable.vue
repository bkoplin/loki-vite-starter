<template>
  <DataTable :value="results">
    <Column v-for="col of columnnames" :field="col" :header="col" :key="col"></Column>
</DataTable>

</template>

<script>

import axios from 'axios';
import { reactive, toRefs } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';
import '../../node_modules/primevue/resources/primevue.min.css';
import '../../node_modules/primeicons/primeicons.css';
import '../../node_modules/primevue/resources/themes/bootstrap4-light-blue/theme.css';

export default {
  setup() {
    const state = reactive({
      columnNames: [],
      results: [],
    });

    if (process.env.NODE_ENV === 'development') {
      axios.get('https://reedsmith.saplingdata.com/cobra/api/urn/com/loki/core/model/api/query/v/?queryUrn=urn:com:reedsmith:cobra:data:insights:Q2EELQGJ:components:component1&format=json&num=1000', { auth: { username: process.env.LOKI_USERNAME, password: process.env.LOKI_PASSWORD } }).then((d) => {
        state.results = d.data.results;
        state.columnNames = d.data.columnNames;
      });
    }

    return {
      ...toRefs(state),
    };
  },
  components: {
    DataTable, Column,
  },
};
</script>

