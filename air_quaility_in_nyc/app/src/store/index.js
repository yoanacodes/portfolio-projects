import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';
import * as _ from 'underscore';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    data: [],
    filteredData: [],
    dataIsReady: false,
    selectedView: "borough",
    selectedDataset: "PM2.5-Attributable Deaths",
    radioValue: "Manhattan",
  },
  mutations: {
    saveData(state, payload) {
      state.data = payload.data;
    },
    modifyActiveView(state, payload) {
      state.selectedView = payload.currentView;
    },
    saveFilteredData(state, payload) {
      state.filteredData = payload.filtered;
      state.dataIsReady = payload.flag;
    },
    updateSelectedVariable(state, payload) {
      state.selectedDataset = payload.dropdownValue;
    },
    updateRadioSelection(state, playload) {
      state.radioValue = playload.selectedRadioBtn;
    }
  },
  getters: {
    getFilter(state) {
      return _.chain(state.filteredData)
        .pluck("name")
        .unique().sortBy().value();
    },
    getRadioButtonValues(state) {
      return _.chain(state.filteredData)
        .filter( d => d['geotype_name'] == "Borough")
        .pluck('geo_place_name')
        .unique().sortBy()
        .value();
    },
    checkIfDataIsReady(state) {
      return state.dataIsReady;
    },    

  },
  actions: {
    fetchData({ commit, state }) {
      return axios
        .get('data/air-quality.json')
        .then( response => {
          commit('saveData', {data: response.data, flag: true});
        })
        .then(() => {
            this.dispatch('filterData')
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        });   
    },
    filterData({ commit, state }) {
      // Only show indicators that are measures of estimated annual rates
    
      const data = [...state.data];

      let filteredData = _.chain(data)
          // select metrics with a multi year time period only to ensure consistency in the x axis comparisons 
          .filter(d => d.time_period.match(/^(\d+-)+\d+$/))
          .each(d => {
            if(d.measure.indexOf("Estimated Annual Rate-") > -1) {
              let measure = d.measure.split("- ");
                // make age formatting consistent across measures
                if(measure[1].indexOf('18') > -1) {
                  d.name = `${d.name} (Adults ${measure[1]})`;
                } else {
                  d.name = `${d.name} (${measure[1]})`;                      
                }
                
                d.measure = measure[0]
            }
            
            d.value = +d.value;
            // clean name
            d.name = d.name.replace(/O3-/g, "");
          })
          .value();
          
          commit('saveFilteredData', {filtered: filteredData, flag: true});

    },     
  },
  modules: {
  }
})
