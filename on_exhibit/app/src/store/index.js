import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import _ from 'underscore';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    filters: Object,
    selectedMuseum: Object,
    data: Object
  },
  mutations: {
    saveFilters(state, payload) {
      // console.log('saving filters', payload.filters)
      state.filters = payload.filters;
    },
    updateSelectedMuseum(state, payload) {
      state.selectedMuseum = payload;
    },
    saveData(state, payload) {
      // console.log('fetching data...', payload.data);
      state.data = payload.data;
    }
  },
  getters: {
    getRandomExhibit: (state) => {
      if(!Array.isArray(state.data)) return;

      const images = _.chain(state.data)
        .pluck('media')
        .map(media => _.filter(media, (m,i) => i === 0 ))
        .value();

        const shuffled = [...images].sort(() => 0.5 - Math.random());

      return shuffled.slice(0, 300);
    },
    getOverviewData: (state) => {

      let museumYears = _.chain(state.data)
                      .groupBy('museum')
                      .map( (d, name) => {
                        return { museum: name, years: _.uniq(_.pluck(d, 'dateClean')) }
                      })
                      .map(d => { 
                        return _.map(d.years, year => {
                          return { museum: d.museum, year: year }
                        });
                       })
                      .flatten()
                      .value();

      return museumYears;
    },
    groupMusuemData: (state) => {

      let group_museums =  _.chain(state.data)
        .groupBy('dateClean')
        .mapObject(year => _.groupBy(year, 'museum'))
        .mapObject((museum) => {
          let format = _.map(museum, (data, museum_name) => {
              return { name: museum_name, data: data }
          });
            return _.sortBy(format, d => d.data.length).reverse();
        })
        .value(); 

        return group_museums;
    },
    getMuseumData: (state) => {
      if(!Array.isArray(state.data)) return;

      return _.chain(state.data)
          .filter(artifact => artifact.museum === state.selectedMuseum.label)
          .value();

    }
  },
  actions: {
    fetchFilters({ commit }) {
      return axios
        .get('data/filters.json')
        .then(response => {
          commit('saveFilters', {filters: response.data, flag: true});
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        });
    },    
    fetchData({ commit }) {
      return axios
        .get('data/formatted_data.json')
        .then(response => {
          commit('saveData', {data: response.data, flag: true});
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        });
    },
 
  },
  modules: {
  }
})
