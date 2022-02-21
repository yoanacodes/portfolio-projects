import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import store from './store'

Vue.config.productionTip = false
Vue.config.debug = true;
Vue.config.devtools = true;


window.Store = {
  data: [],
  filteredData: [],
  selectedVariable: "PM2.5-Attributable Deaths",
  radioValue: "Manhattan",
  activeView: "hood"
};

const vm = new Vue({
  vuetify,
  render: h => h(App),

  updated() {
    console.log("+++ App Updated +++");
  },

  destroyed() {
    console.log("+++ App Destroyed +++");
  },

  store,

  mounted() {
    console.log("+++ App Mounted +++");
  }
}).$mount('#app')
