<style lang="sass">
    .svg-container 
        display: inline-block
        position: relative
        width: 100%
        padding-bottom: 0%
        vertical-align: top
        overflow: hidden
    .slope-active
        stroke: pink
        opacity: 1 !important
        transition: stroke 0.5s

    .str-active
        fill: red
        opacity: 1 !important
        transition: fill 0.5s
    .period
        display: inline-block
        font-weight: 400
    .place
        display: block
        font-weight: 600
        font-size: 14pt
</style>

<template >
    <v-col cols="12" xs="12" md="12" lg="12" xl="11" class="mb-12">
        <h3 class="mt-10">{{population}} {{measure}} <br>for {{variable}}</h3>
        <div id="plot"  class="svg-container"></div>
    </v-col>
</template>

<script>
import * as d3 from 'd3';
import * as _ from 'underscore';
import {mapState} from 'vuex';

export default {
    name: 'plot',
    props: ['dataset'],
    computed: {
        ...mapState(['selectedView'])
    },
    data: () => ({ 
        variable: "",
        measure: "",
        population: ""
    }),
    watch: {
        dataset: {
            handler: function (data) {
                this.render();
            },
                deep: true
            }
    },
    mounted() {
        if(this.dataset.length) this.render(); 
    },    
    methods: {
        strToClass(stringy) { 
            // a method that takes a string and turns into a class name by removing forbidden characters/spaces 
            return `str-${stringy.replace(/\s/g, "")}` 
        },
        formatDataset: function() {
            let data = [...this.dataset];

            // find all key value pairs that are duplicates,
            // we need them to shift the overlapping labels
            // on the slope chart (i.e. two neighborhoods have a value of 11.2 and labels are overlapping)
            let duplicates = _.chain(data)
                .groupBy('geo_place_name')
                .map((d,i) => d[0])
                .groupBy('value')
                .filter(function(v,k){ return v.length > 1 })
                .flatten()
                .pluck('geo_place_name')
                .value();

                // only apply the overlapped label to the second value
                duplicates = duplicates.shift();

                // add a flag to tell d3 if the labels are overlapping
                _.each(data, n => {

                    if(duplicates && duplicates.indexOf(n.geo_place_name) > -1) {
                        return n.isOverlapped = true;
                    } else {
                        return n.isOverlapped = false;
                    }

                });  

            // find the unique dates to pass to x axis
            let dates = _.chain(data)
                .pluck("period")
                .unique()
                .sortBy(_.identity)
                .value();

                return {data: data, dates: dates};
        },
        render: function() {

            // followed this example: https://observablehq.com/@mbostock/cancer-survival-rates
            // https://observablehq.com/@didoesdigital/9-may-2020-d3-scatterplot-with-voronoi-tooltips
            

            d3.select("#plot svg").remove();

            const {data, dates} = this.formatDataset();

            // get title variables
            this.variable = data[0].name;
            this.population = data[0].measure
            this.measure = data[0].measure_info;

            // console.log("Draw slopchart");

            let margin = ({top: 30, right: 100, bottom: 20, left: 120}),
                height = 800,
                width = 1300,
                formatValue = d3.format(","),
                formatTime =  d3.timeParse("%Q");

            if(this.selectedView === "hood" ) {
                // give more space to the names if view is by neighborhood
                // as the labels are longer
                margin.left = 200;
                height = 1800
            } 

            const svgW = width + margin.left + margin.right;
            const svgH = height + margin.top + margin.bottom;

            const svg = d3.select("#plot")
                .append("svg")
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", `0 0 ${svgW} ${svgH}`)
                .classed("svg-content", true)
                .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

            // scales
            const x = d3.scalePoint()
                .domain(dates)
                .range([margin.left, width - margin.right]);

            const y = d3.scaleLinear()
                .domain(d3.extent(data, d => d.value))
                .range([height - margin.bottom, margin.top]);

            const line = d3.line()
                .x(d => x(d.period))
                .y(d => y(d.value));

            const voronoi = d3.Delaunay
                .from(data, d => x(d.period), d => y(d.value))
                .voronoi([margin.left, margin.top, width - margin.right, height - margin.bottom]); // ensures voronoi is limited to the chart area

            const tooltip = d3.select("#tooltip");

            // axis
            svg.append("g")
                  .attr("transform", `translate(0,${margin.top})`)
                  .style("font-size", "12pt")
                    .call(d3.axisTop(x))
                    .call(g => g.select(".domain").remove())
                    .call(g => g.select(".domain").selectAll('.tick text'));
            
            // expose y axis for debugging
                // svg.append("g")
                //       .attr("transform", `translate(${width},${0})`)
                //         .call(d3.axisRight(y))
                //         .call(g => g.select(".domain").remove())

            // add viz
            let viz = svg.append("g")
                .attr("transform", "translate(0, 30)");

            // append the paths
            viz.append("g")
                .attr("fill", "none")
                .attr("stroke", "#000")
                .selectAll("path")
                .data(d3.groups(data, d => d.geo_place_name))
                .join("path")
                .attr("class", "slope-line")
                .attr("d", function([, group]) { 
                    group.forEach(g => g.line = this);   
                    return line(group);
                })
                .call(path => path.clone(true))
                .attr("stroke", "#fff")
                .attr("stroke-width", 5);

            // apend the circles
            viz.append("g")
                .attr("fill", "#fff")
                .selectAll("circle")
                .data(data)
                .join("circle")
                .attr("cx", d => x(d.period))
                .attr("cy", d => y(d.value) )
                .attr("r", 20);

            // add text
            viz.append("g")
                .attr("text-anchor", "middle")
                .selectAll("text")
                .data(data)
                .join("text")
                .attr("x", d => x(d.period))
                .attr("y", d => y(d.value))
                .attr("dy", "0.35em")
                .style("font-size", "10pt")
                .text(d => formatValue(d.value));

            // add labels
            viz.append("g")
                .attr("text-anchor", "end")
                .selectAll("text")
                .data(d3.groups(data, d => d.geo_place_name))
                .join("text")
                .attr("class", ([key]) => 'yLabel ' + this.strToClass(key))
                .attr("x", margin.left - 35)
                .style("font-weight", 600)
                .attr("y", ([key, [d]]) => y(d.value) + (d.isOverlapped) * 12 )
                .attr("dy", "0.35em")
                .text(([key]) => key);
      
            // voronoi
            viz.append("g")
                .attr("class", "voronoiWrapper")
                .selectAll("path")
                .data(data)
                .join("path")
                .attr("opacity", 0.5)
                // .attr("stroke", "#ff1493") // Hide overlay
                .attr("fill", "none")
                .style("pointer-events", "all")
                .attr("d", (d,i) => voronoi.renderCell(i))
                .on("mouseover", (event, d) => {
                    
                    let ttpHeight =  tooltip.node().getBoundingClientRect().height ;

                    d3.selectAll(".slope-line")
                        .style("opacity", 0.3)
                        .classed("slope-active", false);

                    d3.selectAll(".yLabel")
                        .classed("str-active", false);

                    d3.select(d.line)
                        .classed("slope-active", true);
                    
                    d3.select('.' + this.strToClass(d.geo_place_name)).classed("str-active", true);

                    tooltip
                        .style("display", "block")            
                        .style("left", (event.pageX + 20) + "px")     
                        .style("top", (event.pageY - (ttpHeight / 2)) + "px")            
                        .html(`<span class='period'>${ d.period }</span> <span class='place'>${d.geo_place_name}</span> ${ d.value } ${this.measure}`);

                })
                .on("mouseout", () => {
                    d3.selectAll(".slope-line")
                        .style("opacity", 1)
                        .classed("slope-active", false);
                    d3.selectAll(".yLabel")
                        .classed("str-active", false);                        
                    tooltip.style("display", "none")
                });

        }
    }
}

</script>
