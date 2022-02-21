<style lang="sass">
  #about
    p
      font-family: Georgia, Times New Roman, serif
      font-size: 12pt
      color: #555
</style>

<template>
  <v-container id="about">
    <v-row class="text-center" justify="center">
      <v-col cols="12" class="mt-4">
        <h1 class="display-2 font-weight-light mb-3">
          Air Quality and Health Outcomes in NYC
        </h1>
      </v-col>
      <v-col cols="8" xs="11" sm="8" md="7" lg="6" xl="5" class="mt-2 mb-12">
        <p>
          This project leverages data visualization to uncover different trends in the air quality of New York City and how they affect the population’s health. By looking at how air quality correlates with different metrics such as  Asthma Hospitalizations or Cardiac and Respiratory Deaths in the context of the city geography, we facilitate the analysis of the data and decision making. 
        </p>
        <p>     
          The main findings are that while the majority of the indicators are trending downwards, meaning there is an overall improvement in the health and air quality outcomes, there are still stark differences between neighborhoods. In certain cases, we even observe a reversing of the positive trends in the 2015-2017 period with sharp upwards spikes returning. 
        </p>
        <p>
          Explore the indicators by selecting a metric from the dropdown and choosing the data breakdown by borough or by neighborhood.
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: 'About'
  }
</script>
