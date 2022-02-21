<template>
    <v-col cols="12"  class="mt-0 pa-0">
        <v-row justify="center" class="text-center justify-center mt-5 pa-5 pt-0">
            <v-radio-group
                v-model="selected"
                label="Select Borough:"
                row
                >
                <v-radio v-for="key in getRadioButtonValues" :key="key"
                    :label="key"
                    :value="key"
                >
                </v-radio>
            </v-radio-group>
        </v-row>
    </v-col>
</template>

<script>
import * as _ from 'underscore';
import { mapGetters, mapMutations, mapState } from 'vuex';

export default {
    name: 'RadioButtons',
    computed: {
        ...mapState(['radioValue']),
        ...mapGetters(['getRadioButtonValues'])
    },
    data: function() {
        return {
            selected: String
        }  
    },
    watch: {
        'selected': function(selected) {
            this.updateRadioSelection({selectedRadioBtn: selected});
        }
    }, 
    mounted() {
        // set default local value to the vuex default
        this.selected = this.radioValue;
    },
    methods: {
        ...mapMutations(['updateRadioSelection'])
    }
}

</script>
