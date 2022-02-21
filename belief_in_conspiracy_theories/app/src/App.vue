<style lang="sass">
  #app
    background: #1a1a1a
    color: #fff
  #tooltip
    background: #222
    color: #fff
    position: absolute
    min-height: 60px
    min-width: 235px
    max-width: 300px
    display: none
    padding: 10px 15px
    opacity: 0.9
    
    span
      display: block
      
    span:first-of-type
      font-style: italic
      
</style>

<template>
  <v-app>
    <v-container>
      <v-main style="background: #222" class="elevation-4">
          <About />
          <Dropdown />
          <Buttons />
          <Bar />
      </v-main>
      <div id="tooltip"></div>
    </v-container>
    
    <Footer />

  </v-app>
</template>

<script>
import About from './components/About.vue';
import Dropdown from './components/Dropdown.vue';
import Buttons from './components/Buttons.vue';
import Bar from './components/Bar.vue';
import Footer from './components/Footer.vue';

export default {
  name: 'App',
  components: {
    About,
    Dropdown,
    Buttons,
    Bar,
    Footer,
  },
  mounted() {
      this.$store.dispatch('fetchData');
  },

}
</script>