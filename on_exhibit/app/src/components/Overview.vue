<style lang="sass">
    #timeline-overview
        margin: 60px 0 0 0

        .svg-container 
            display: inline-block
            position: relative
            width: 100%
            padding-bottom: 0%
            vertical-align: top
            overflow: hidden
        .y-axis
            text
                font-size: 12pt
        .x-axis
            text
                font-size: 8pt
        
        h2
            font-weight: 300
            margin: 0 auto
            float: left
            text-align: center

</style>

<template>
    <div v-if="getOverviewData.length" id="timeline-overview">
        <v-row align="center" justify="center">
            <h2>Overview: Timeline of the artifacts in each museum</h2>
        </v-row>        
        <v-row align="center" justify="center" class="mb-12 pb-12">
            <v-col cols="12" xs="12" md="12" lg="12" xl="8" >
                <div id="overview" class="svg-container"></div>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import * as d3 from 'd3';
import * as _ from 'underscore';
import {mapGetters} from 'vuex';

export default {
    name: 'Overview',
    props: [],
    computed: {
        ...mapGetters(['getOverviewData'])
    },
    data: () => ({ 
    }),
    watch: {
        getOverviewData() {
          this.render();
        },
    },
    mounted() {
        if(this.getOverviewData.length) this.render()
    },    
    methods: {

        render: function() {

            d3.selectAll("#overview svg").remove();

            let dataset = [...this.getOverviewData];

            let museums = _.pluck(dataset, "museum").sort((a,b) => a > b ? -1 : 1 ),
                years = _.pluck(dataset, 'year');

                years = this.fillMissingYears(years);

            let margin = ({top: 10, right: 10, bottom: 40, left: 420}),
                height = 300,
                width = 1000;
          
            const svgW = width + margin.left + margin.right;
            const svgH = height + margin.top + margin.bottom;

            const svg = d3.select("#overview")
                .append("svg")
                // .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", `0 0 ${svgW} ${svgH}`)
                // .classed("svg-content", true)
                .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

            const yScale = d3.scaleBand()
                .domain(museums)
                .range([height, 0])
                .paddingOuter([.25])
                .paddingInner([.5]);    

        // y axis
            const yAxis = d3.axisLeft(yScale)
               
            svg.append("g")
                .attr("class", "y-axis")
                .call(yAxis);

            const xScale = d3.scaleBand()
                .domain(years)
                .range([0, width]);

            const xAxis = d3.axisBottom(xScale);

            svg.append("g")
                .attr("class", "x-axis")
                .call(xAxis)
                .call(g => g.selectAll(".tick text").text((d,i) => i % 2 != 0 ? '' : d < 0 ? `${-d} BCE` :  `${d}`))
                .attr('transform', `translate(0, ${height})`);

            const squares = svg.selectAll("rect")
                .data(dataset)
                .enter()
                .append("rect")
                .attr("x", d => xScale(d.year))
                .attr("y", d => yScale(d.museum))
                .attr("width", 10)
                .attr("height",  10)                
                .attr("fill", "#222");

        },
        fillMissingYears(dates_array) {
            let fill_dates = [];
            let start = d3.min(dates_array);
            let end = d3.max(dates_array);

            if(start < 0) {
                start -= 1000;
            } else if(start < 1500) {
                start -= 100;
            } else {
                start -= 10
            }

            while(end > start) {
                if(start < 0) {
                        start += 1000;
                    } else if(start < 1500) {
                        start += 100;
                    } else {
                        start += 10
                    }
                fill_dates.push(start)
            }  
            
            return fill_dates;
        }
    }
}

</script>
