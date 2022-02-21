<style lang="sass">
  #tooltip
    position: absolute
    min-width: 150px
    min-height: 70px
    background-color: #fff
    color: #222
    padding: 10px
    display: none
    .topic
        font-weight: 600
        font-size: 14pt

  .v-card__text, .v-card__title
    word-break: normal    
    
</style>

<template>
  <v-app>
    <v-container fluid class="grey lighten-5 pa-0 ma-0">
    
      <v-main>  
        <About />
        <Visualizations />
      </v-main>
       
      <Footer />
      <div id="tooltip"></div>
    
    </v-container>
  </v-app>
</template>

<script>
import About from './components/About.vue';
import Footer from './components/Footer.vue';
import Visualizations from './components/Visualizations.vue';
import axios from 'axios';

export default {
  name: 'App',
  components: {
    About,
    Footer,
    Visualizations
  },
  data: () => ({
    store: window.Store
  }),
  created() {

    axios.get('data/formatted_dataset.json')
      .then( response => {
        this.store.data = response.data;
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
      
  }

};
</script>
