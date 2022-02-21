<style scoped lang="sass">
 #about
  background: #ddd
  color: #222


  h1 
    font-size: 36pt
    font-weight: 500
    line-height: 1em
    font-family: Georgia, serif
    font-style: italic
    span
      line-height: 1em
      margin-top: 10px
      display: block
      font-size: 26pt
      font-weight: 300
      font-family: Roboto, sans-serif
      font-style: normal

    // h1 
    //   font-size: 28pt
    //   font-weight: 400
    //   line-height: 1em
    //   span
    //     line-height: 1.6em
    //     display: block
    //     font-size: 15pt
    //     font-weight: 300
    //   // span:last-child
    //   //   font-size: 10pt
    //   //   line-height: 0.5em

  p
    font-size: 14pt
    font-family: serif
  #logos
    margin: 20px 0 10px 0
    
    img
      image-rendering: crisp-edges

</style>

<template>
  <v-container fluid id="about">
    <v-row justify="center" align="center">
        <div id="logos">
          <v-img src="assets/parsons.jpeg" width="60" style="float: left; filter: grayscale(100%);" class="mr-4"></v-img>
          <v-img contain src="assets/smithsonian.png" width="95"></v-img>
        </div>
    </v-row>    

    <v-row justify="center" class="text-center mt-4">

      <v-col class="mt-2 pa-0" cols=12>
        <h1 class=" mb-3">
          On Exhibit: 
          <span>What's in the Smithsonian?</span>
        </h1>
      </v-col>

      <v-col class="mt-0 mb-10" cols="12" xs="8" md="8" lg="6" xl="5">
        <p class="font-weight-regular">
          On Exhibit focuses on artifacts that are exhibited, digitalized and part of the open access API of the Smithsonian Institution, as this gives an interesting perspective on the restrictions museums face in making their collections more accessible to the public. This approach creates, in a way, an online tour of the available artifacts in each museum. Users can choose a museum to explore with a dropdown, and see everything available in that museum (based on the data in the API) chronologically. This not only allows users to see the subset of artifacts that are displayed in the physical space of the museums, but also get to explore virtually a subset of these same artifacts, effectively creating an online tour of the museum - something ever more important in the times of COVID where a lot of constraints exist on public gatherings.
          </p>
      </v-col>


    </v-row>
  </v-container>
</template>

<script>

  export default {
    name: 'About',
    data: () => ({
      
    })
  }
</script>
