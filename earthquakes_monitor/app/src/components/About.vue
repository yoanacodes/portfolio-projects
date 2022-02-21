<style lang="sass">
#about
  p
    font-family: Georgia, Times New Roman, serif
    font-size: 12pt
    color: #555
  h1
    font-size: 24pt
    line-height: 1.1em

</style>
<template>
  <v-container id="about" class="mb-10">
    <v-row class="text-center" justify="center" align="center">
      <v-col cols="7" xs="7" sm="7" md="7" lg="5" xl="5" class="mt-4">
        <h1 class="font-weight-light">
          <span class="font-weight-bold">Earthquakes Monitor</span>: Earthquakes Around the World in the Past 7 Days
        </h1>
      </v-col>
    </v-row>
    <v-row class="text-center" justify="center" align="center">
      <v-col cols="8" xs="11" sm="8" md="7" lg="6" xl="5" class="mt-2 mb-12">
        <p>The United States Geological Survey (<a href="https://earthquake.usgs.gov/earthquakes/feed/v1.0/csv.php" target="_blank">USGS</a>) is a US science agency, which among its many missions, monitors global earthquakes at frequencies ranging from the past hour to 1 day to 30 days back.</p>

        <p>The Earthquakes Monitor project, visualizes all earthquakes in the last seven days, happening worldwide, and allows users to easily filter and navigate the data on a map. Users can decide the magnitude of the earthquakes to focus on, by adjusting a sliding filter, between all earthquakes and earthquakes above specific magnitude. This feature can be used to filter only potentially more significant earthquakes without loosing the sheer volume of all earthquakes happening around the world. The color coding and point size, further highlight potential stronger earthquakes.</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

  export default {
    name: 'About'
  }
</script>
