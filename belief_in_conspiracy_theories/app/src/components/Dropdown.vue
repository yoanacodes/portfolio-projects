<template>
    <v-row v-if="dataIsReady" justify="center">
        <v-col cols="11" xs="12" md="12" lg="8" xl="8">
            <v-combobox
                dark
                outlined
                solo
                color="green accent-2"
                v-model="selectedValue"
                :items="questions"
                item-text="label"
                item-value="value"
                label="Select a question"
                return-object
            ></v-combobox>
        </v-col>
    </v-row>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

  export default {
    name: 'Dropdown',

    data: function() {
      return {
        selectedValue: '',
      }
    },
    computed: {
    ...mapState(['questions']),
    dataIsReady: function() {
        return typeof this.questions === 'object' ? true : false;
      },
  },
    mounted() {
      this.$store.dispatch('fetchDictionary');
      this.selectedValue = {label: "The spread of certain viruses and/or diseases is the result of the deliberate, concealed efforts of some organization", value: "Q4"}
    },
    watch: {
        selectedValue: function(selectedValue) {
          this.setDropdownValue({selectedQuestion: selectedValue})
        },
    },
    methods: {
        ...mapMutations(['setDropdownValue']),
    }
  }
</script>
