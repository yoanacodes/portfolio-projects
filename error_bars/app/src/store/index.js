import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import * as d3 from 'd3'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		dataset: Array,
    sampleData: Array,
		dataIsReady: false,
    sampleDataIsReady: false
	},
	mutations: {
		saveData(state, payload) {
			state.dataset = payload.dataset;
			state.dataIsReady = payload.dataIsReady;
		},
		saveSampleData(state, payload) {
			state.sampleData = payload.dataset;
			state.sampleDataIsReady = payload.dataIsReady;
		}    
	},
	actions: {
		getSampleData({commit, state}, payload) {
			d3.csv("data/data_subset.csv", d3.autoType).then(function(data) {
				commit('saveSampleData', {dataset: data, dataIsReady: true})
			});
		},    
		getData({commit, state}, payload) {
			d3.csv("data/std_mean.csv", d3.autoType).then(function(data) {
				commit('saveData', {dataset: data, dataIsReady: true})
			});
		}
	},
});
