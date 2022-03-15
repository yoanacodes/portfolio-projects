<style lang="sass">
p 
  font-size: 14pt
  font-family: serif
</style>

<template>
  <v-row justify="center" class="text-center mb-12">
    <v-col class="ma-0 mt-6 pa-0" cols=12>
      <h1 class="display-2 font-weight-light mb-3">
          What Do You Believe In?
      </h1>
      <h2 style="font-weight: 300; font-size: 16pt;" class="ma-0 pa-0 mb-10">Measuring Belief in Conspiracy Theories</h2>
    </v-col>

    <v-col class="ma-0 mb-10" cols="10" xs="12" md="10" lg="7" xl="6">
      <p>
        Conspiracy theories and the belief in them have exponentially grown in the last few years and are increasingly influencing public opinion and life. Therefore, it is of great importance to analyze what we know historically about what makes certain groups more likely to subscribe to such believes and see if there are any strategies successfully employed in the past to unite people who are likely to be divided by such believes. This project explores which conspiracy theories are most "popular" and if there is any pattern in the way different demographic groups respond to them. 
      </p>

      <p>This project visualizes the data collected based on the Generic Conspiracist Beliefs (GCB) scale <a href="https://www.frontiersin.org/articles/10.3389/fpsyg.2013.00279/full" target="_blank">(link to paper)</a>. The data was collected by Open Psychometrics through a <a href="https://openpsychometrics.org/tests/GCBS/" target="_blank">self-reported online survey</a> in 2016. The GCB scale includes 15 questions related to important facets of conspiracism, and respondents can answer them on a 5-point scale: from strongly disagree to strongly agree. After the initial 15 questions, respondents are asked to complete an additional survey with the listed demographics metrics, and only respondents over 13 years of age who agree to have their data collected and used for research are provided in the dataset.
      </p>
    </v-col>
  </v-row>
</template>

<script>

  export default {
    name: 'About'
  }
</script>
