<template>
  <v-btn-toggle
        v-model="selectedBtn"
        group
  >
  <v-row align="center" justify="center" class="mb-6">
      <v-col cols="12"  xs="12" md="12" lg="10" xl="8" align="center">
        <v-btn v-for="(item, i) in demographics" :key="i"
          dark
          outlined
          color="grey lighten-1"
          class="mr-2 mb-2"
          :value="item"
          >
          {{item.btn_label}}
        </v-btn>  
      </v-col> 
  </v-row>
</v-btn-toggle>
 
</template>

<script>
    import { mapState, mapMutations } from 'vuex';

  export default {
    name: 'Buttons',
    computed: {
        ...mapState(['demographics', 'selectedDemographics'])
    },
    data: function() {
      return {
        selectedBtn: ''
      }
    },
    watch: {
        selectedBtn: function(selectedValue) {
          this.setButtonValue({selectedBtnValue: selectedValue})
        },
    },     
    methods: {
        ...mapMutations(['setButtonValue']),
    }
  }
</script>
