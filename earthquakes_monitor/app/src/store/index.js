import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    data: Object,
    dataIsReady: false
  },
  mutations: {
    saveData(state, payload) {
      state.data = payload.dataset;
      state.dataIsReady = true;
    }
  },
  actions: {
    fetchData({ commit, state }, payload) {
      return axios
        .get(`${payload.dataset}`)
        .then( response => {
          commit('saveData', {dataset: response.data});
          // console.log(response.data);
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        });   
    },    
  }
})
