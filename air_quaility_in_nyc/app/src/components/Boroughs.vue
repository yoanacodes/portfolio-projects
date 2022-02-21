<template>
    <v-container v-if="checkIfDataIsReady">
        <v-row id="boroughs"  justify="center" class="text-center mt-6">
            <Dropdown></Dropdown>
            <Slopechart :dataset="filteredBoroughs"> </Slopechart>    
        </v-row>
    </v-container>
</template>

<script>
import Dropdown from './generic/DropdownFilter.vue';
import Slopechart from './Slopechart.vue';
import * as _ from 'underscore';
import { mapGetters, mapState } from 'vuex';

export default {
    name: 'Boroughs',
    components: {
        Slopechart,
        Dropdown
    },
    computed: {
        ...mapState(['filteredData', 'selectedDataset']),
        ...mapGetters(['checkIfDataIsReady']),
        filteredBoroughs: function() {
            // filter the data
            let boroughs = _.chain(this.filteredData)
                .filter(d => d.geotype_name == "Borough")
                .filter(d => d.name === this.selectedDataset)
                .each(d => {
                    // console.log( d.geo_place_name, d.name, d.measure, d.period, d.value )
                    d['period'] = d.time_period;
                    d.value = +(parseFloat(d.value).toFixed(2));
                })
                .sortBy('period')
                .value();         
                // console.log(boroughs)

                return boroughs;            
        }
    }    
}
</script>
