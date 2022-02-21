<template>
  <v-app>
    
    <v-main>  
      <About />
      <Visualizations />
    </v-main>

    <Footer />

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
    mounted() {
      this.$store.dispatch('fetchData', {dataset: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'});
    }
  }
</script>
