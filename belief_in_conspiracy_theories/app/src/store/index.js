import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import * as _ from 'underscore';
import * as d3 from 'd3';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    questions: Object,
    demographics: Object,
    answers: Object,
    selectedQuestion: Object,
    selectedDemographics: Object,
    data: Object,
  },
  getters: {
    getGroupedData: (state) => {
      let currentQuestion = state.selectedQuestion;
      let currentDemographic = state.selectedDemographics;

      function normalizeValue(sum, value) {
        // normalize the data to make them comparable
        return ((value / sum) * 100).toFixed(1);
      }

      function getLabelFromNumberMapping(searchValue) {
        // replace numeric values with user friendly labels
        if(typeof currentDemographic === 'function' || currentDemographic === undefined) return

        let currentDemographicValue = state.selectedDemographics.value;

        if(searchValue == "0") { return "No Answer" }
        if(currentDemographicValue === 'age' || currentDemographicValue === 'familysize') {
          return +searchValue;
        } 
        let map = state.selectedDemographics.values.filter(v => v.value.toString() === searchValue);
        return  map.length ? map[0].label.replace(/\*/g, '') : false;
      }

      if(typeof currentQuestion === 'function' || currentQuestion === undefined) return false;
      if(typeof state.data === 'function' || state.data === undefined) return false;

      
      // if a demographic is selected
      if( typeof currentDemographic != 'function' && currentDemographic != undefined  ) {
        // return a matrix of question response by demographic
        let currentDemographicValue = state.selectedDemographics.value;

        // save the sum for each demographic so the data can be normalized at the end
        let sums = {};

        let breakdown = _.chain(state.data)
          .groupBy(currentQuestion.value)
          .mapObject((answerCount, category) =>  {
            let groupByDemographicValue = _.chain(answerCount)
                                          .groupBy(currentDemographic.value)
                                          .mapObject(set => set.length)
                                          .value();
            
            // add each demographic to sums
            _.mapObject(groupByDemographicValue, (value, key) => {
                if(!Object.prototype.hasOwnProperty.call(sums, key) ) {
                  sums[key] = 0;
                }
                sums[key] += value
            });


              let subset = _.chain(groupByDemographicValue)
                      .map((count, answer) => {
                        return {
                                id: +answer, 
                                label: getLabelFromNumberMapping(answer), 
                                rowValue: count
                              } 
                      })
                      .filter(d => d.id != '0')
                      .sortBy('id')
                      .value()

                      if(currentDemographicValue == 'age') {
                        subset = _.filter(subset, d => d.label < 100)
                      } 
                      if(currentDemographicValue == 'familysize') {
                        subset = _.filter(subset, d => d.label < 20)
                      } 

                      return subset

            })
            .map((count, answer) => {return {id: answer, label: state.answers[answer], values: count} })
            .filter(d => d.id != '0')
            .map(questionCategory => {
              // for each of the answers of the question
              // get the responses by demographic
              _.map(questionCategory.values, demographicValue => {
                // add a new key to it with the normalized data point
                demographicValue['value'] = normalizeValue( sums[demographicValue.id], demographicValue.rowValue );
                return demographicValue;
              })

              return questionCategory;
            })
            .value(); 

            return breakdown;

      } else {
        // else group the responses for the question and return
        let sum = 0
        return _.chain(state.data)
            .groupBy(currentQuestion.value)
            .mapObject((value, key) => { 
              sum += value.length;
              return value.length 
            })
            .map((count, answer) => {return {id: answer, label: state.answers[answer], value: normalizeValue(sum, count), rowValue: count} })
            .filter(d => d.id != '0')
            .value();         
            

        }

    },

  },
  mutations: {
    saveFilters(state, payload) {
      // save the data for filters
      state.questions = payload.questions;
      state.demographics = payload.demographics;
      state.answers = payload.answers;

    },
    setDropdownValue(state, payload) {
      state.selectedQuestion = payload.selectedQuestion;
    },
    setButtonValue(state, payload) {
      state.selectedDemographics = payload.selectedBtnValue;
    },
    saveData(state, payload) {
      state.data = payload.data;
    }

  },
  actions: {
    fetchDictionary({ commit, state }, payload) {
      return axios
        .get('data/dictionary.json')
        .then( response => {
          commit('saveFilters', {questions: response.data.questions, demographics: response.data.demographics, answers: response.data.answers})
        })
        .catch(function (error) {
          console.log(error);
        });   
    },
    fetchData({ commit, state }, payload) {
      d3.csv("data/data.csv").then( function(data) {
          commit('saveData', {data: data});
    })
    .catch(function (error) {
      console.log(error);
    }); 
    }
  },
  modules: {
  }
})
