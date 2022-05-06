<style lang="sass">
#viz
  line, path
    stroke: #333
  .yAxis .tick text
    color: #ddd
  .xAxis .tick text
    color: #ddd

  .xAxis path, .yAxis path
    stroke: #444
  .tick line
    stroke: #444
</style>
<template>
  <v-container>
    <v-card class="mt-5" color="#222">
      <v-card-subtitle
        class="headline text-center mb-0 pb-0"
        style="color: #fff"
      >
        Approval Ratings of President Biden for 2021 (in %)
      </v-card-subtitle>
      <h5 class="text-subtitle-2 text-center mt-0 pt-0" style="color: #999">
        Minimum, Maximum, and Average of Monthly Polling Data
      </h5>

      <v-row align="center" justify="center">
        <v-checkbox
          class="mt-12 mr-6"
          dark
          v-model="checkbox"
          label="Show All Polls"
          color="white"
          :value="false"
          hide-details
        ></v-checkbox>

        <v-checkbox
          v-if="checkbox"
          class="mt-12"
          dark
          v-model="checkboxSample"
          label="Size Polls by Sample Size"
          color="white"
          :value="true"
          hide-details
        ></v-checkbox>
      </v-row>

      <div id="viz"></div>
    </v-card>

    <v-card class="elevation-0" color="#222">
      <v-row class="mb-12 ml-8">
        <div style="height: 80px; width: 400px">
          <v-img src="legend.png"></v-img>
        </div>
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
import { mapState } from "vuex";
import * as d3 from "d3";

export default {
  name: "Bar",
  computed: {
    ...mapState(["dataset", "dataIsReady", "sampleDataIsReady", "sampleData"]),
    svgHeight() {
      return this.height + this.margin.top + this.margin.bottom;
    },
    xScale() {
      const xScale = d3
        .scaleBand()
        .range([0, this.width])
        .domain(this.dataset.map((value) => value.month_name))
        .padding(0.5);
      return xScale;
    },
    yScale() {
      const yScale = d3.scaleLinear().range([this.height, 0]).domain([27, 70]);
      return yScale;
    },
  },
  data: () => ({
    width: 760,
    height: 530,
    margin: { top: 10, right: 40, bottom: 30, left: 50 },
    svg: Object,
    checkbox: false,
    checkboxSample: true,
    positiveColor: "#00C9A7",
    negativeColor: "#FF8066",
  }),
  mounted() {
    if (this.dataIsReady && this.sampleDataIsReady) this.render();
  },
  watch: {
    dataIsReady: function () {
      if (this.dataIsReady && this.sampleDataIsReady) this.render();
    },
    sampleDataIsReady: function () {
      if (this.dataIsReady && this.sampleDataIsReady) this.render();
    },
    // checkboxes to show/hide distribution of polls
    checkboxSample: function () {
      if (this.checkboxSample) {
        this.svg
          .selectAll("circle")
          .attr("r", 2)
          .transition()
          .duration(600)
          .attr("r", (d) => Math.sqrt(d["samplesize"]) / 20);
      } else {
        this.svg
          .selectAll("circle")
          .attr("r", (d) => Math.sqrt(d["samplesize"]) / 20)
          .transition()
          .duration(300)
          .attr("r", 2);
      }
    },
    // add circles representing the distribution of the polls
    checkbox: function () {
      if (this.checkbox) {
        this.checkboxSample = true;

        this.svg
          .append("g")
          .attr("class", "circle-group")
          .selectAll("circle")
          .data(this.sampleData.sort((a, b) => a.month - b.month))
          .enter()
          .append("circle")
          .attr(
            "cx",
            (d) => this.xScale(d["month_name"]) + this.xScale.bandwidth() / 2
          )
          .attr("cy", (d) => this.yScale(d["approve"]))
          .attr("r", (d) => Math.sqrt(d["samplesize"]) / 20)
          .attr("opacity", 0.05)
          .attr("fill", (d) => {
            let thisMean = this.dataset.filter(
              (e) => e["month_name"] === d["month_name"]
            )[0]["mean"];
            return d["approve"] >= thisMean
              ? this.positiveColor
              : this.negativeColor;
          });
      } else {
        this.svg.select(".circle-group").remove();
      }
    },
  },

  methods: {
    render: function () {
      let dataset = this.dataset;
      let width = this.width;
      let svgHeight = this.svgHeight;
      let height = this.height;

      let svgWidth = width + this.margin.left + this.margin.right;

      this.svg = d3
        .select("#viz")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
        .classed("svg-content", true)
        .style("background", "#222")
        .append("g")
        .attr(
          "transform",
          "translate(" + this.margin.left + "," + this.margin.top + ")"
        );

      // create axes
      this.svg
        .append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(this.xScale));

      this.svg
        .append("g")
        .attr("class", "yAxis")
        .call(d3.axisLeft(this.yScale));

      let measures = ["min", "mean", "max"];

      // assign green or red color to datapoints based on whether they are below or above the mean
      measures.forEach((m, index) => {
        const colors = [this.negativeColor, "#ddd", this.positiveColor];

        // append min, max, and mean lines
        this.svg
          .append("g")
          .attr("class", m)
          .selectAll("rect")
          .data(dataset)
          .enter()
          .append("rect")
          .attr("x", (d, i) => this.xScale(d.month_name))
          .attr("y", (d) => {
            let start = m == "max" ? "max" : "mean";
            return this.yScale(d[m]);
          })
          .attr("width", this.xScale.bandwidth())
          .attr("height", (d) => {
            return m === "mean" ? 3 : 1;
          })
          .attr("fill", colors[index])
          .style("opacity", (d) => {});
      });

      this.svg
        .append("g")
        .attr("class", "text")
        .selectAll("text")
        .data(dataset)
        .enter()
        .append("text")
        .attr("x", (d) => this.xScale(d["month_name"]))
        .attr("y", (d) => this.yScale(d["max"] + 0.7))
        .attr("dx", (d) => 0)
        .text((d) => `max: ${d.max}`)
        .style("font-size", "8pt")
        .attr("fill", "#999");

      this.svg
        .append("g")
        .attr("class", "text")
        .selectAll("text")
        .data(dataset)
        .enter()
        .append("text")
        .attr("x", (d) => this.xScale(d["month_name"]))
        .attr("y", (d) => this.yScale(d["min"] - 1.5))
        .attr("dx", (d) => 0)
        .text((d) => `min: ${d.min}`)
        .style("font-size", "8pt")
        .attr("fill", "#999");

      this.svg
        .append("g")
        .attr("class", "text")
        .selectAll("text")
        .data(dataset)
        .enter()
        .append("text")
        .attr("x", (d) => this.xScale(d["month_name"]))
        .attr("y", (d) => this.yScale(d["mean"] - 1.5))
        .attr("dx", (d) => -5)
        .text((d) => `mean: ${parseInt(d.mean)}`)
        .style("font-size", "8pt")
        .attr("fill", "#999");
    },
  },
};
</script>
