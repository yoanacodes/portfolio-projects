<template>
  <v-app>
    <v-app-bar color="gray-darken-2" dark app>
      <v-toolbar-title
        >Visualizing Uncertainty - The New Error Bar</v-toolbar-title
      >
    </v-app-bar>

    <v-main style="background: #222">
      <v-tabs v-model="tab" background-color="grey darken-2" color="basil" grow>
        <v-tab href="#tab-proposal">Proposal</v-tab>
        <v-tab href="#tab-data">Data</v-tab>
        <v-tab href="#tab-viz">Visualization</v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab" style="background: #222">
        <v-tab-item value="tab-proposal">
          <v-container>
            <v-card class="mt-6">
              <v-card-title class="text-center font-weight-thin mb-0 pb-0">
                Proposal Sketch
              </v-card-title>
              <v-img class="mt-6" src="error-bar-prototype.png"></v-img>
            </v-card>
          </v-container>
        </v-tab-item>

        <v-tab-item value="tab-data">
          <v-container>
            <v-card class="mt-6">
              <v-card-title class="text-center font-weight-thin mb-0 pb-0">
                Original Dataset
              </v-card-title>
              <v-img class="mt-6" src="data-before.png"></v-img>
            </v-card>
            <v-card class="mt-12">
              <v-card-title class="text-center font-weight-thin mb-0 pb-0">
                Data After Analysis
              </v-card-title>
              <v-img class="mt-6" src="data-after-subset.png"></v-img>
            </v-card>
          </v-container>
        </v-tab-item>

        <v-tab-item value="tab-viz">
          <Bar />
        </v-tab-item>
      </v-tabs-items>
    </v-main>
  </v-app>
</template>

<script>
import Bar from "./components/Bar.vue";

export default {
  name: "App",
  components: {
    Bar,
  },
  mounted() {
    this.$store.dispatch("getData");
    this.$store.dispatch("getSampleData");
  },
  data() {
    return {
      tab: "tab-viz",
      items: ["proposal", "data", "visualization"],
    };
  },
};
</script>
