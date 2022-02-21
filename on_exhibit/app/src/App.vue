<style lang="sass">
  #tooltip
    position: absolute
    min-width: 150px
    max-width: 220px
    min-height: 70px
    background-color: #fff
    color: #222
    padding: 10px
    display: none
    border-radius: 5px
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.15), 0 2px 4px 0 rgba(0, 0, 0, 0.12)

  .v-card__text, .v-card__title
    word-break: normal    
    
</style>

<template>
  <v-app>
    <v-container fluid class="pa-0" :style='{background: bgColor}'>
      <v-main>  
        
              <v-item-group
                v-model="window"
                class="shrink mr-6 elevation-10"
                mandatory
                style="background: #fff; color: #222; border-radius: 5px; padding: 10px; z-index: 1000; position: fixed; top: 45%;"
              >
                <v-item
                  v-for="n in length"
                  :key="n"
                  v-slot="{ active, toggle }"          
                >
                  <div>

                  <v-tooltip right>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        :input-value="active"
                        icon
                        x-small
                        :color="btnColor"
                        @click="toggle"
                        v-bind="attrs"
                        v-on="on"
                      >
                        <v-icon x-small>mdi-record</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ n === 1 ? "Generate Exhibit" : "Expolore the timeline" }}</span>
                  </v-tooltip>

                  </div>
                </v-item>
              </v-item-group> 
          
        <v-window
            v-model="window"
            class="elevation-1"
            vertical
          >
            <v-window-item :key="0">
                <YourExhibit @timeline="window = 1" />
            </v-window-item>

            <v-window-item :key="1">
              <About />
              <Visualizations />
              <Footer />
            </v-window-item>        
          </v-window>

          </v-main>
          

          <div id="tooltip"></div>
    
     <!-- </v-row>  -->
    </v-container>
  </v-app>
</template>

<script>
import About from './components/About.vue';
import Footer from './components/Footer.vue';
import Visualizations from './components/Visualizations.vue';
import YourExhibit from './components/YourExhibit.vue';

import { mapState } from 'vuex'

export default {
  name: 'App',
  components: {
    About,
    Footer,
    Visualizations,
    YourExhibit    
  },
  computed: {
    ...mapState(['filters']),
    bgColor: function () {
      return this.window === 1 ? '#eee' : '#111'
    },
    btnColor: function() {
      return this.window != 1 ? '#333' : '#333'
    }
  },
  data: () => {
    return {
      length: 2,
      window: 2, // window 1 = visualizations, window 2 = your exhibit splash page
    }
  },

  watch: {

  },
  created() {

    this.$store.dispatch('fetchFilters');
    this.$store.dispatch('fetchData');

  },
  methods: {
    changeView: function() {
      this.window = 1;
    }
  }

};
</script>
