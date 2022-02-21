import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false
Vue.config.debug = true;
Vue.config.devtools = true;


window.Store = {
  data: []
};

new Vue({
  vuetify,
  render: h => h(App) 
}).$mount('#app')

// add comments

