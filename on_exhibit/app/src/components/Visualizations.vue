<template>
  <v-container style="min-height: 100vh">
      
    <Overview />

    <v-row align="center" justify="center" class="mb-12">
      <DropdownFilter />
    </v-row>
    <Beeswarm />
    
  </v-container>

</template>

<script>
import DropdownFilter from './DropdownFilter.vue';
import Beeswarm from './Beeswarm.vue';
import Overview from './Overview.vue';

export default {
    name: 'Visualizations',
    components: {
        DropdownFilter,
        Beeswarm,
        Overview
    }
}

</script>
