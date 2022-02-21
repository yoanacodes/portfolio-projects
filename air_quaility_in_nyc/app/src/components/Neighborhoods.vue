<template>
    <v-container v-if="checkIfDataIsReady">
        <v-col>
            <v-row id="hoods">
                <Dropdown />
                <RadioButtons> </RadioButtons>
                <Slopechart :dataset="filteredHoods"> </Slopechart>
            </v-row>
        </v-col>
    </v-container>
</template>

<script>
import Dropdown from './generic/DropdownFilter.vue';
import Slopechart from './Slopechart.vue';
import RadioButtons from './generic/RadioButtons.vue';
import * as _ from 'underscore';
import { mapGetters, mapState } from 'vuex';

export default {
    name: 'Neighborhoods',
    components: {
        Slopechart,
        Dropdown,
        RadioButtons
    },
    computed: {
        ...mapState(['filteredData', 'selectedDataset', 'radioValue']),
        ...mapGetters(['checkIfDataIsReady']),
        filteredHoods: function() {
            // filter the data
            let hoods = _.chain(this.filteredData)
                .filter(d => d.geotype_name == "UHF42")
                .filter(d => d.borough_code == this.radioValue)
                .filter(d => d.name === this.selectedDataset)
                .each(d => {
                    // console.log( d.geo_place_name, d.name, d.measure, d.period, d.value )
                    d['period'] = d.time_period;
                    d.value = +(parseFloat(d.value).toFixed(2));
                })
                .sortBy('period')
                .value();

                // console.log('hoods: ', hoods)

                return hoods;            
        }
       
    }
}

</script>
