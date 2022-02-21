<template>
    <v-row justify="center" class="ma-0 pa-0 mt-4" style="margin-bottom: -20px !important">
        
        <v-col cols="6" class="ma-0 pa-0">
            <v-select
                v-model="selected"
                :items= "getFilter"
                label="Select a variable"
                dense
                solo
                class="ma-0 pa-0"                
            ></v-select>
        </v-col>

    </v-row>
</template>

<script>
import * as _ from 'underscore';
import { mapGetters, mapMutations, mapState } from 'vuex';

export default {
    name: 'DropdownFilter',
    computed: {
        ...mapState(['selectedDataset']),
        ...mapGetters(['getFilter', 'getSelectedDataset'])
    },
    data: function() {
        return {
            selected: String
        }  
    },
    watch: {
        'selected': function(selected) {
           this.updateSelectedVariable({dropdownValue: selected})
        }
    }, 
    mounted() {
        // set the local state of the dropdown to default store value
        this.selected = this.selectedDataset;
    },
    methods: {
        ...mapMutations(['updateSelectedVariable'])
        
    }
}

</script>
