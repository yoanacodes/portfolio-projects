<style lang="sass">
#map
  min-height: 80vh

  .v-label 
    font-weight: 500
    font-size: 10pt
    color: #333

  #mapContainer 
    // width: 100vw
    height: 55vh
    margin: 0 0 30px 0
  
  h3
    font-size: 14pt
  h4
    font-size: 12pt
  h5
    font-size: 10pt
  .legend 
      line-height: 18px
      color: #555
      background: #fff
      padding: 20px
      border-radius: 5px
  .leaflet-bottom.leaflet-right
      z-index: 999
  .legend i
      width: 18px
      height: 18px
      float: left
      margin-right: 8px
      opacity: 0.7


</style>
<template>
    <v-container id="map">
        <v-row justify="center" class="text-center">
          <v-col cols="12" xs="11" sm="11" md="12" lg="12" xl="12">
            <v-slider
              class="ma-0 pt-2"
              v-model="slider"
              step="1"
              ticks="always"
              thumb-size="28"
              thumb-label="always"
              label="Show Earthquakes With Magnitude Above:"
              min=0
              max=7
              thumb-color="grey darken-3"
              track-color="primary lighten-2"
              track-fill-color="grey darken-4"
            ></v-slider>

            <div id="mapContainer" class="elevation-4"></div>            
          </v-col>
        </v-row>
    </v-container>
</template>

<script>


import * as d3 from 'd3';
import * as _ from 'underscore';
import "leaflet/dist/leaflet.css";
import * as L from 'leaflet';

import { mapState } from 'vuex';

export default {
    name: 'Map',
    components: {

    },
    data() {
        return {
            map: null,
            slider: 0
        }
    },
    computed: {
        ...mapState(['data', 'dataIsReady'])
    },
    watch: {
      data: function() {
        this.render();
      },
      slider: function() {
        this.render();
      }
    },
    mounted() {
        if(this.data && this.data.length) this.render();
    },
    methods: {
        render: function() {
            if(this.map) this.map.remove();
            if(!this.dataIsReady) return;

            // init map
            this.map = L.map('mapContainer').setView([51.505, -0.09], 2);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
              subdomains: 'abcd',
              maxZoom: 20
            }).addTo(this.map);

            // layer styles and color coding
            let colors = d3.scaleLinear()
                .range(["#4cc9f0", "#f72585"])
                .domain([0,10]);

            let radius = d3.scaleSqrt()
              .range([2, 12])
              .domain([1,10]);

            // map geojson attributes to map points
            L.geoJSON(this.data.features, {
              pointToLayer: function(feature, latlng) {
                // position points
                return L.circleMarker(latlng);
              },
              style: function(feature) {
                // style
                return {
                    fillColor: colors(feature.properties.mag),
                    weight: 0.5,
                    opacity: 1,
                    radius: radius(feature.properties.mag),
                    color: 'white',
                    fillOpacity: 1
                }
              },
              filter: (feature) => {
                // connect to slider's model value and filter out map
                if(feature.properties.mag >= this.slider) {
                  return feature;
                }
              }  
            }).bindTooltip(function (layer) {
                let ttp = `
                <h3 class="font-weight-regular">${layer.feature.properties.place}<h3> 
                <h5>${(new Date(layer.feature.properties.time)).toString().split(" (")[0]}</h5>
                <h4>Magnitude: ${layer.feature.properties.mag}</h4>
                `
                return ttp;
            }, 
              { direction: 'top'} )
            .addTo(this.map);

            this.legend(colors);
        },
        legend: function(colors) {
          
          // legend settings
          const legend = L.control({position: 'bottomright'});

          legend.onAdd = function (map) {

              let div = L.DomUtil.create('div', 'legend elevation-2'),
                  magnitudes = [0,1,2,3,4,5,6,7,8,9,10],
                  labels = [];

              for (let i = 0; i < magnitudes.length; i++) {
                if(i < magnitudes.length-1) {
                  
                  div.innerHTML += `<i style='background: ${colors(magnitudes[i+ 1] )} '></i> 
                  ${magnitudes[i]} &ndash; ${magnitudes[i + 1]} <br> `;

                }
            }

              return div
          };

          legend.addTo(this.map)

        }

    },
  beforeDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }	
}

</script>
