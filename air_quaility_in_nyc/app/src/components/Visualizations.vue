<template>
  <v-container>
    <v-row justify="center" class="text-center">

        <v-btn-toggle v-model="activeView" mandatory rounded>
            <v-btn value="borough" small>
                <v-icon>mdi-home-city</v-icon> 
                &nbsp; By Borough
            </v-btn>
            <v-btn value="hood" small>
                <v-icon>mdi-map-marker</v-icon>
                By Neighborhood
            </v-btn>
        </v-btn-toggle>

        <Boroughs v-if="activeView === 'borough'"> </Boroughs>
        <Neighborhoods v-if="activeView === 'hood'"></Neighborhoods>

    </v-row>
  
  </v-container>
</template>

<script>

import Neighborhoods from './Neighborhoods.vue';
import Boroughs from './Boroughs.vue';
import { mapMutations, mapState } from 'vuex';


export default {
    name: 'Visualizations',
    components: {
        Neighborhoods,
        Boroughs
    },
    data() {
        return {
            activeView: String
        }
    },
    computed: {
        ...mapState(['selectedView'])
    },
    watch: {
        activeView: function(view) {
            this.modifyActiveView({currentView: this.activeView})
        } 
    },
    mounted() {
        // default to store default selected view
        this.activeView = this.selectedView
    },
    methods: {
        ...mapMutations(['modifyActiveView'])
    }
}

</script>
