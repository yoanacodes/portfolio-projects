<template>
    <v-row align="center" justify="center" class="ma-0 pa-0 mt-4" v-if="typeof filters === 'object'">
        
        <v-col cols="8" class="ma-0 pa-0">
            <v-combobox
                v-model="selected"
                :items="filters"
                item-text="label"
                item-value="value"
                label="Select a museum"
                item-color="blue lighten-3"
                color="grey"
                single
                return-object
            >
                <template slot="item" slot-scope="data">
                    <v-icon small>mdi-bank</v-icon>
                    &nbsp;{{data.item.label }}
                    <v-spacer/>
                    &nbsp;&nbsp;({{data.item.count}})
                </template>
            </v-combobox>
        </v-col>

    </v-row>
</template>

<script>
import * as _ from 'underscore';
import { mapGetters, mapMutations, mapState } from 'vuex';

export default {
    name: 'DropdownFilter',
    computed: {
        ...mapState(['filters', 'selectedMuseum']),
        ...mapGetters(['getMuseumData'])
    },
    data: function() {
        return {
            selected: Object
        }  
    },
    watch: {
        'selected': function(selected) {
           this.updateSelectedMuseum(selected);
        }
    }, 
    mounted() {
        // set the local state of the dropdown to default store value
        this.selected = {
            "label": "Smithsonian American Art Museum",
            "value": "smithsonian_american_art_museum",
            "count": 875
        };
    },
    methods: {
        ...mapMutations(['updateSelectedMuseum'])
        
    }
    

}

</script>
