<style lang="sass">
  #tooltip
      position: absolute
      min-width: 150px
      min-height: 70px
      background-color: #222
      color: #fff
      padding: 10px
      display: none
  #appBg
    background: #eee
  #vizBg
    background: #fff
</style>

<template>
  <v-app id="appBg">
    
    <About  />
    <v-main id="vizBg" class="pa-8">  
      <Visualizations />
    </v-main>
    
    <Footer />
    <div id="tooltip" />
  </v-app>
</template>

<script>
import About from './components/About.vue';
import Footer from './components/Footer.vue';
import Visualizations from './components/Visualizations.vue';

export default {
  name: 'App',
  components: {
    About,
    Footer,
    Visualizations
  },
  created() {
    this.$store.dispatch('fetchData');
  },
};
</script>
