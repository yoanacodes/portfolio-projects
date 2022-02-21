<style scoped lang="sass">

#heatmapWrapper 
    h2
        font-size: 16pt            
        font-weight: 600
        text-transform: uppercase
    h6

    p
        font-size: 8pt

    .svg-container 
        display: inline-block
        position: relative
        width: 100%
        padding-bottom: 0%
        vertical-align: top
        overflow: hidden

    .svg-content 
        display: inline-block
        position: absolute
        top: 0
        left: 0

</style>


<template>
    <v-container id="heatmapWrapper">
        <h2 class="mt-4">Topics of Preserved Artifacts 1860-2010</h2>
        <v-row justify="center" class="ma-0 pa-0 mt-4 mb-6">
            <v-col cols="12" xs="12" sm="12" md="12" lg="10" xl="10" class="pa-0 ma-0">
                <div id="heatmap" class="svg-container"></div>
            </v-col>
        </v-row>

        <Modal v-if="activeCell.hasOwnProperty('label')" :data="activeCell" @closeDialog=" activeCell = {} "></Modal>
    
    </v-container>
</template>

<script>
import * as d3 from 'd3';
import * as _ from 'underscore';
import Modal from './modal.vue';


export default {
    name: 'Heatmap',
    data: () => ({ 
        store: window.Store,
        activeCell: {}
    }),
    components: {
        Modal
    },
    watch: {
        'store.data': function(data) {
            if(data.length) {
                this.render();
            }
        }
    },
    mounted() {
        if(this.store.data.length) this.render(); 
    },
    methods: {
        fillMissingYears: (dates_array) => {
            // function to add decades without artifcast to the x axis
            // in order to show correct distance between events
            let fill_dates = [];
            let start = d3.min(dates_array);
                start -= 10 // add one year in the beginning for padding
            let end = d3.max(dates_array); // add the end

            while(end > start) {
                start += 10
                fill_dates.push(start)
                }      
            
            return fill_dates;
        },
        render: function() {

            d3.select('#heatmap svg').remove();

            let data = this.store.data;

            const margin = ({top: 40, right: 280, bottom: 30, left: 280}),
                width = 800,
                height= 1100;


            const svgW = width + margin.left + margin.right;
            const svgH = height + margin.top + margin.bottom;

            const svg = d3.select("#heatmap")
                .append("svg")
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", `0 0 ${svgW} ${svgH}`)
                .classed("svg-content", true)
                .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");         
            
            // only show artifacts that have more than cutoff (one) artifacts 
            const cutoff = 1;
            let cutoff_data = [];
            let groupedData = _.chain(data)
                .groupBy('topic')
                .mapObject( (v, k) => {  
                    return _.groupBy(v, 'date');
                })
                .mapObject((years, label) => {
                    return _.mapObject( years, (a, y) => {
                        if( a.length > cutoff  ) {
                            cutoff_data.push( { label: label, year: +y, data: a} )
                        }
                    });
            }).value(); 
            
            // get an array of unique dates in the dataset
            const dates_array = _.chain(cutoff_data).pluck('data').flatten().pluck('date').unique().value();
            // get the unique list of labels
            const labels_array = _.chain(cutoff_data).pluck('label').sortBy(_.identity).reverse().value();
            // add empty dates in between, so the time axis is data driven and shows correct distance between events
            const fill_dates = this.fillMissingYears(dates_array);

            const x = d3.scaleBand()
                .range([ 0, width ])
                .domain(fill_dates)
                .padding(0.02)

            const y = d3.scaleBand()
                .range([ height, 0 ])                
                .domain(labels_array)
                .padding(0.02);

            const colors = d3.scaleSequential()
                .interpolator(d3.interpolateBlues)
                // .range(['#ddd', '#222'])
                .domain([0, 15]);

            // scale top
            svg.append("g")
                .attr("class", "x-axis")
                .style("font-size", 12)
                .call(d3.axisTop(x))
                .call(g => g.selectAll(".tick text").attr("dy", -5))
                .call(g => g.selectAll(".tick text").text(d => d + 's'))
                .call(g => g.select(".domain").remove())

            // scale bottom
            svg.append("g")
                .attr("class", "x-axis")
                .style("font-size", 12)
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .call(g => g.select(".domain").remove())
                .call(g => g.selectAll(".tick text").text(d => d + 's'))

            // scale left
            svg.append("g")
                .attr("class", "y-axis")
                .style("font-size", 13)
                .call(d3.axisLeft(y))
                .call(g => g.select(".domain").remove())
                .call(g => g.selectAll(".tick line").remove())

            // scale right
            svg.append("g")
                .attr("class", "y-axis")
                .style("font-size", 13)
                .attr("transform", "translate(" + width + "," + 0 + ")")
                .call(d3.axisRight(y))
                .call(g => g.select(".domain").remove())
                .call(g => g.selectAll(".tick line").remove())

            // add gridline
            svg.selectAll("line")
                .data(labels_array)
                .enter()
                .append("line")
                .attr("x1", function(d) { return x(d)})
                .attr("x2", width )
                .attr("y1", function(d) { return y(d) })
                .attr("y2", function(d) { return y(d) })                
                .attr("stroke", "#f2f2f2")
                .style("opacity", 0.7);
            
            // add rect
            svg.selectAll("rect")
                .data(cutoff_data)
                .enter()
                .append("rect")
                .attr("class", "heatmap-rect")
                .attr("x", function(d) { return x(d.year)  })
                .attr("y", function(d) { return y(d.label) })
                .attr("width", x.bandwidth() )
                .attr("height", y.bandwidth()  )
                .style("fill", d => colors(d.data.length) )
                .style("cursor", "pointer")
                .on("mouseover", (event, d) => this.mouseover(event, d)  )
                .on("mouseout", () =>  {
                    d3.selectAll(".heatmap-rect")
                        .attr("stroke", "none");

                    d3.selectAll("g.x-axis text")
                        .transition()
                        .duration(500)                    
                        .attr("fill", '#222');

                    d3.selectAll("g.y-axis text")
                        .transition()
                        .duration(500)                    
                        .attr("fill", '#222');


                    d3.select("#tooltip")
                        .style("display", "none");

                })
                .on("click", (event, d) => this.activeCell = d);
    

        },
         mouseover: function(event, d) {
            let ttpHeight =  d3.select("#tooltip").node().getBoundingClientRect().height ;

            d3.selectAll(".heatmap-rect")
                .attr("stroke", "none");
                                
            d3.select(event.srcElement)
                .attr("stroke", "#999")

            d3.select("#tooltip")
                .style("display", "block")            
                .style("left", (event.pageX + 20) + "px")     
                .style("top", (event.pageY - (ttpHeight / 2)) + "px")            
                .html(`<span class='topic'>${ d.label }</span> <br> ${ d.data.length } artifacts in the ${ d.year }s`);

            let thisYear = d.year,
                thisTopic = d.label;

            d3.selectAll("g.x-axis text")
                .transition()
                .duration(500)
                .attr("fill", d =>  thisYear === d ? '#222' : '#999');

            d3.selectAll("g.y-axis text")
                .transition()
                .duration(500)            
                .attr("fill", d =>  thisTopic === d ? '#222' : '#999');


        }
    }
}

</script>
