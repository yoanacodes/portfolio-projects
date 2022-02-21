<style scoped lang="sass">
#about
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

  p
    font-size: 14pt
    font-family: serif

  #logos
    margin: 20px 0 10px 0
    
    img
      image-rendering: crisp-edges

</style>

<template>
  <v-container id="about">
    <v-row justify="center" align="center">
        <div id="logos">
          <v-img src="assets/parsons.jpeg" width="60" style="float: left; filter: grayscale(100%)" class="mr-4"></v-img>
          <v-img contain src="assets/smithsonian.png" width="95"></v-img>
        </div>
    </v-row>    
    <v-row justify="center" class="text-center mt-4">

      <v-col class="mt-2 pa-0" cols=12>
        <h1 class="mb-3">
         {{ "What We Fought and Fight for:"}}
          <span>The History of Activism</span>
        </h1>
      </v-col>

      <v-col class="mt-0 mb-10" cols="12"  xs="10" sm="10" md="7" lg="9" xl="6">
        <p class="font-weight-regular">
           We have seen an uptick in activism, spanning multiple movements such as race, immigration, women’s rights, lgbt rights, and general demand for equality across all populations. These fights are not new and it is fascinating to see how the artifacts and visuals associated with activism have evolved throughout time.  
        </p>
        <p class="font-weight-regular">
          Partnering with the Smithsonian Institution (the world's largest museum, education, and research complex) during a joined collaboration with Parsons School of Design was a great opportunity to explore the question of activism in its historical context. The fact that the Smithsonian museums contain ephemera dating back to the 18th century speaks to the importance of these artifacts in preserving history and human’s plight for change. This project explores the topic of “Memorabilia and Ephemera – Political and Activist Ephemera” from the Smithsonian API and visualizes images that has a CC0 license. 
        </p>
        <p class="font-weight-regular">
          It attempts to answer questions such as: What historic movements associated with activism have taken place throughout history? What ephemeral artifacts, such as posters and pamphlets, have we preserved in museums? How has the imagery evolved throughout time?
        </p>        
        <p class="font-weight-regular">
          Explore the heatmap and click on a topic of interest to view images of preserved artifacts. 
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
