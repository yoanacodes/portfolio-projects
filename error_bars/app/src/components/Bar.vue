<style lang="sass">
#viz
  line
    stroke: #333
  .yAxis .tick text
    color: #ddd
  .xAxis .tick text
    color: #ddd
  .xAxis path, .yAxis path
    stroke: #333
  .tick line
    stroke: #444
</style>
<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="9">
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
              class="mt-7 mr-6"
              dark
              v-model="checkbox"
              label="Show All Polls"
              color="white"
              :value="false"
              hide-details
            ></v-checkbox>

            <v-checkbox
              v-if="checkbox"
              class="mt-7"
              dark
              v-model="checkboxSample"
              label="Size Polls by Number of Participants"
              color="white"
              :value="false"
              hide-details
            ></v-checkbox>
          </v-row>

          <div id="viz" class="mt-6"></div>
        </v-card>
        <v-card class="elevation-0" color="#222">
          <v-row class="ml-0 mt-1">
            <v-col cols="12">
              <v-img 
              :src="legendToDisplay"
              max-width="721px"></v-img>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
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
        .padding(0.25);
      // .padding(0.85);

      return xScale;
    },
    xScaleVoronoi() {
      const xScale = d3
        .scaleBand()
        .range([0, this.width])
        .domain(this.dataset.map((value) => value.month_name))
        .padding(1);
      // .padding(0.85);

      return xScale;
    },
    yScale() {
      const yScale = d3.scaleLinear().range([this.height, 0]).domain([27, 70]);
      return yScale;
    },
    legendToDisplay() {
      if (this.checkbox && this.checkboxSample) {
        return "size.svg";
      } else if (this.checkbox && !this.checkboxSample) {
        return "color.svg";
      } else {
        return "min_max.svg";
      }
    }
  },
  data: () => ({
    width: 760,
    height: 400,
    margin: { top: 10, right: 40, bottom: 40, left: 50 },
    svg: Object,
    checkbox: false,
    checkboxSample: false,
    positiveColor: "#00C9A7",
    negativeColor: "#FF8066",
    defaultCircleRadius: 2,
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
    checkboxSample: function () {
      if (this.checkboxSample) {
        this.svg
          .selectAll("circle")
          .transition()
          .duration(500)
          .attr("r", (d) => Math.sqrt(d["samplesize"]) / 20);
      } else {
        this.svg
          .selectAll("circle")
          .transition()
          .duration(200)
          .attr("r", this.defaultCircleRadius);
      }
    },
    checkbox: function () {
      this.drawAllPolls();
    },
  },
  methods: {
    drawAllPolls: function () {
      if (this.checkbox) {
        this.checkboxSample = false;

        this.svg
          .append("g")
          .attr("id", "circle-group")
          .selectAll("circle")
          .data(this.sampleData.sort((a, b) => a.samplesize - b.samplesize))
          .enter()

          .append("circle")
          .attr("id", (d) => `id_${d.id}`)
          .attr(
            "cx",
            (d) => this.xScale(d["month_name"]) + this.xScale.bandwidth() / 2
          )
          .attr("cy", (d) => this.yScale(d["approve"]))
          .attr("r", (d) =>
            this.checkboxSample
              ? Math.sqrt(d["samplesize"]) / 20
              : this.defaultCircleRadius
          )
          .attr("fill-opacity", (d) => {
            return 0.05;
          })
          .attr("fill", (d) => {
            let thisMean = this.dataset.filter(
              (e) => e["month_name"] === d["month_name"]
            )[0]["mean"];
            return d["approve"] >= thisMean
              ? this.positiveColor
              : this.negativeColor;
          });

        this.drawTooltip();
      } else {
        this.svg.select("#voronoi-wrapper").remove();
        this.svg.select("#circle-group").remove();
      }
    },
    drawTooltip: function () {
      const dataset = this.sampleData;

      const voronoi = d3.Delaunay.from(
        dataset,
        (d) => this.xScaleVoronoi(d["month_name"]),
        (d) => this.yScale(d["approve"])
      ).voronoi([0, 0, this.width, this.height]); // ensures voronoi is limited to the chart area

      const formatNumber = d3.format(",");
      const ttp = d3.select("#tooltip");

      this.svg
        .append("g")
        .attr("id", "voronoi-wrapper")
        .selectAll("path")
        .data(dataset)
        .join("path")
        .attr("opacity", 0.5)
        .attr("stroke", "none")
        .attr("fill", "none")
        .style("pointer-events", "all")
        .attr("d", (d, i) => voronoi.renderCell(i))
        .on("mouseover", (event, d) => {
          let thisMean = this.dataset.filter(
            (e) => e["month_name"] === d["month_name"]
          )[0]["mean"];

          let color =
            d["approve"] >= thisMean ? this.positiveColor : this.negativeColor;

          let ttpContent = `<h3 class="text-uppercase">${d.month_name}</h3>
            <div><span class="font-weight-light">Approval: </span><span class="approval text-button" style="background: ${color}">${
            d.approve
          }</span> </div>
            <div><span class="font-weight-light">Poll Grade: </span><span class="grade text-button">${
              d.grade === null ? "none" : d.grade
            }</span></div>
            <div><span class="font-weight-light">Pollster: </span><span class="pollster text-button">${
              d.pollster
            }</span></div>
            <div><span class="font-weight-light">Sample Size: </span><span class="sampleSize text-button">${formatNumber(
              d.samplesize
            )}</span> </div>

            `;

          d3.selectAll("#circle-group circle").attr("stroke", "none");
          d3.select("#months").selectAll("text").style("opacity", 0);

          let activeCircle = d3
            .select(`#id_${d.id}`)
            .node()
            .getBoundingClientRect();

          d3.select(`#${d.month_name}`).selectAll("text").style("opacity", 1);

          d3.select(`#${d.month_name}`)
            .select(".month_column")
            .attr("fill", "#111")
            .style("pointer-events", "none");

          d3.select(`#id_${d.id}`)
            .attr("stroke", "yellow")
            .attr("stroke-width", "2pt")
            .attr("stroke-opacity", 1)
            .style("pointer-events", "none")
            .raise();

          ttp
            .style("display", "block")
            .transition()
            .duration(300)
            .style("opacity", 0.98);
          ttp
            .style("left", activeCircle.x + activeCircle.width / 2 + 55 + "px")
            .style(
              "top",
              activeCircle.y -
                ttp.node().getBoundingClientRect().height / 2 +
                "px"
            )
            .style("pointer-events", "none")
            .html(ttpContent);
        })
        .on("mouseout", () => {
          d3.selectAll("#circle-group circle")
            .attr("stroke", "none")
            .style("pointer-events", "all");
          d3.select("#months").selectAll("text").style("opacity", 0);
          d3.selectAll(".month_column")
            .attr("fill", "transparent")
            .style("pointer-events", "all");
          ttp.style("display", "none").style("opacity", 0);
        });
    },
    render: function () {
      const dataset = this.dataset;
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
      let vueRef = this;

      this.svg
        .append("g")
        .attr("id", "months")
        .selectAll("g")
        .data(dataset)
        .enter()
        .append("g")
        .attr("id", (d) => `${d.month_name}`)
        .each(function (d) {
          let that = this;
          d3.select(this)
            .append("rect")
            .attr("class", "month_column")
            .attr("width", vueRef.xScale.bandwidth())
            .attr("height", vueRef.height)
            .attr("fill", "transparent")
            .attr("x", (d) => vueRef.xScale(d.month_name))
            .on("mouseenter", function (event, d) {
              d3.select(this).attr("fill", "#111");
              d3.select(that).selectAll("text").style("opacity", 1);
            })
            .on("mouseleave", (event, d) => {
              d3.selectAll(".month_column").attr("fill", "transparent");
              d3.select(this).selectAll("text").style("opacity", 0);
            });

          measures.forEach((m, index) => {
            const colors = [vueRef.negativeColor, "#ddd", vueRef.positiveColor];
            d3.select(this)
              .append("rect")
              .attr("x", (d, i) => vueRef.xScale(d.month_name))
              .attr("y", (d) => {
                let start = m == "max" ? "max" : "mean";
                return vueRef.yScale(d[m]);
              })
              .attr("width", vueRef.xScale.bandwidth())
              .attr("height", (d) => {
                return m === "mean" ? 3 : 1;
              })
              .attr("fill", colors[index])
              .style("opacity", (d) => {});
          });

          d3.select(this)
            .append("text")
            .attr("x", (d) => vueRef.xScale(d["month_name"]))
            .attr("y", (d) => vueRef.yScale(d["max"] + 0.4))
            .attr("dx", (d) => 5)
            .text((d) => `max: ${d.max}`)
            .style("font-size", "8pt")
            .attr("fill", "#999")
            .style("opacity", 0);

          d3.select(this)
            .append("text")
            .attr("x", (d) => vueRef.xScale(d["month_name"]))
            .attr("y", (d) => vueRef.yScale(d["min"] - 1.1))
            .attr("dx", (d) => 5)
            .text((d) => `min: ${d.min.toFixed()}`)
            .style("font-size", "8pt")
            .attr("fill", "#999")
            .style("opacity", 0);

          d3.select(this)
            .append("text")
            .attr("x", (d) => vueRef.xScale(d["month_name"]))
            .attr("y", (d) => vueRef.yScale(d["mean"] - 1.2))
            .attr("dx", (d) => 1.5)
            .text((d) => `mean: ${parseInt(d.mean)}`)
            .style("font-size", "8pt")
            .attr("fill", "#999")
            .style("opacity", 0);
        });

      this.drawAllPolls();
    },
  },
};
</script>
