<template>
    <v-row justify="center" class="text-center ma-0 pa-0">
        <Heatmap></Heatmap>
    </v-row>
</template>

<script>

import Heatmap from './Heatmap.vue';

export default {
    name: 'Visualizations',
    components: {
        Heatmap
    }
}

</script>
