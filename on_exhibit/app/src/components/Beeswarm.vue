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
    .shadow 
        -webkit-filter: drop-shadow( 0px 0px 1px #999 )
        filter: drop-shadow( 0px 0px 1px #999 )
    .thumb
        max-width: 200px
        max-height: 200px
    .axis text
        font:
            size: 16pt
            weight: 300
        fill: #777
    .circle
        cursor: pointer
    .artifact-title
        font:
            size: 14pt
            weight: 500
        line-height: 0.8em
        
</style>

<template>
    <div>
        <v-row align="center" justify="center">
            <v-col cols="8" class="text-center">
                <h3 class="mt-10">{{selectedMuseum.label}} <br> {{selectedMuseum.count}} Artifacts</h3>
            </v-col>
        </v-row>    
        <v-row align="center" justify="center">
            <v-col cols="12" xs="12" md="12" lg="10" xl="9">
                <div id="viz"  class="svg-container"></div>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import * as d3 from 'd3';
import * as _ from 'underscore';
import {mapState, mapGetters} from 'vuex';

export default {
    name: 'plot',
    props: [],
    computed: {
        ...mapState(['selectedMuseum']),
        ...mapGetters(['getMuseumData'])
    },
    data: () => ({ 

    }),
    watch: {
        getMuseumData() {
            this.render();
        },
    },
    mounted() {
        if(this.getMuseumData && this.getMuseumData.length) this.render()
    },    
    methods: {
        fillMissingYears(dates_array) {
            // the dataset contains only years for which there are artifacts.
            // in order to make the timeline truely reflect the distance between different decaded
            // the array of dates has to be filled in with the remaining years at a set and equal interval
            let bce = [], ad_mid = [], ad_latest = [];

            let start = d3.min(dates_array);
            
            let end = d3.max(dates_array);

            if(start < 0) {
                start -= 200;
                end += 20;
            } else if(start < 1580) {
                start -= 100;
                end += 20;
            } else {
                start -= 20
                end += 20;
            }
    
    
            while(end > start) {
               if(start < 0) {
                    bce.push(start);
                    start +=  start < 0 ? 500 : 10;

               } else if(start <= 1580) {                    
                    ad_mid.push(start);
                    start += 100;
               } else {
                    ad_latest.push(start);
                    start += 10;                    
               }
            }      
            return [bce, ad_mid, ad_latest];
        },        
        makeAxisTicks(data, generatedYears) {
                // find which dates actually have artifacts
                let datesWithArtifacts = _.chain(data).pluck("date").pluck("label").uniq().sortBy().value();
                let beginningYear = generatedYears[0],
                    finalYear = generatedYears[generatedYears.length-1];
                let fillerLabels = generatedYears.filter( (d,i) => i % 4 === 0 );

                if(datesWithArtifacts.indexOf(beginningYear) === -1) {
                    datesWithArtifacts.push(beginningYear);
                }
                if(datesWithArtifacts.indexOf(finalYear) === -1) {
                    datesWithArtifacts.push(finalYear)
                }

                return _.uniq([...datesWithArtifacts, ...fillerLabels]).sort();
       },
        render: function() {

            d3.selectAll("#viz svg").remove();

            let data = [...this.getMuseumData];
                
            // find the years in the dataset
            let years = _.chain(data).pluck('date').pluck('label').uniq().sortBy().value();
            // fill in the gaps between the existing years so it is a true time scale allowing comparison
                years = this.fillMissingYears(years);


            _.each(years, year => {
                    let thisData = _.filter(data, d => {
                        let date = d.date.label;
                        return date >= year[0] && date <= year[year.length-1]
                    })

                    if(thisData.length) {
                        // generate the axis ticks to pass to d3
                        let theseTicks = this.makeAxisTicks(thisData, year);
                        // dynamically determine the height of each timeline
                        let thisHeight = 0;

                        if(thisData.length > 100) {
                            thisHeight = thisData.length * theseTicks.length
                        } else if(thisData.length < 20) {
                            thisHeight = 600
                        } else {
                            thisHeight = 1500
                        }

                       this.drawTimeline(year, thisHeight , theseTicks, thisData);
                    }

            });


        },
        drawTimeline: function(years, thisHeight, ticks, data) {

            let margin = ({top: 100, right: 100, bottom: 50, left: 100}),
                height = thisHeight,
                width = 1000,
                formatTime =  d3.timeParse("%Q");
          
            const svgW = width + margin.left + margin.right;
            const svgH = height + margin.top + margin.bottom;

            const svg = d3.select("#viz")
                .append("svg")
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", `0 0 ${svgW} ${svgH}`)
                .classed("svg-content", true)
                .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");
            

            const minMaxYear = d3.extent(years, d => d).reverse();

            const yScale = d3.scaleLinear()
                .domain(minMaxYear)
                .range([height, 0]);

            const minLabel = minMaxYear[1] < 0 ? `${-minMaxYear[1]} BCE` : `${minMaxYear[1]} AD`,
                  maxLabel = minMaxYear[0] < 0 ? `${-minMaxYear[0]} BCE` : `${minMaxYear[0]} AD`;
            const theseYearsLabel = `Artifacts on exhibit between ${minLabel} and ${maxLabel}`;

            let title = svg.append("g")
                    .attr("class", "title")
                    .append('text')
                    .attr("x",  width / theseYearsLabel.length * 11)
                    .attr("y", -60)
                    .style("font-size", "16pt")
                    .style("font-weight", 300)
                    .text(theseYearsLabel.toUpperCase());

  
        // middle axis
            const yAxisMiddle = d3.axisLeft(yScale)
                    .tickValues([]) //
                    .tickFormat((d, i) => d < 0 ? `${-d} BCE` :  `${d} AD`)
                    .tickSizeOuter(0);        
            svg.append("g")
                .call(yAxisMiddle)
                .attr("stroke", "#ddd")
                .attr("stroke-width", "1px")
                .style("opacity", 0.3)
                .attr("stroke-dasharray", "1, 1")
                .style("transform", `translateX(${width / 2}px`);
             
        // left axis
            const axisPadding = 15;
            const yAxisLeft = d3.axisLeft(yScale)
                    .tickValues(ticks) //ticks
                    .tickFormat((d, i) => d < 0 ? `${-d} BCE` :  `${d} AD`);
            svg.append("g")
                .attr("class", "axis")
                .call(yAxisLeft)
                .call(g => g.selectAll('path').remove())
                .style("transform", `translateX(${axisPadding}px`);  

        // right axis
            const yAxisRight = d3.axisRight(yScale)
                    .tickValues(ticks) //ticks
                    .tickFormat((d, i) => d < 0 ? `${-d} BCE` :  `${d} AD`);

            svg.append("g")
                .attr("class", "axis")
                .call(yAxisRight)
                .call(g => g.selectAll('path').remove())
                .style("transform", `translateX(${width - axisPadding}px`);     

        // dashed lines
            svg.selectAll()
                .data(ticks)
                .enter()
                .append("line")
                .attr("x1", function(d) { return 0})
                .attr("x2", width )
                .attr("y1", function(d) { return yScale(d) })
                .attr("y2", function(d) { return yScale(d) })                
                .attr("stroke", "#999")
                .attr("stroke-dasharray", "2, 2")
                .style("opacity", 0.7);
        //force
            const force = d3.forceSimulation(data)
                    .force('forceY', d3.forceY(d => yScale(d.dateClean)).strength(1))
                    .force('forceX', d3.forceX(width/2 ).strength(0.9)) //+ 110
                    .force('collide', d3.forceCollide(21))
                    .stop();
            const NUM_ITERATIONS = 500;
            for (let i = 0; i < NUM_ITERATIONS; ++i) {
                force.tick();
            }
            force.stop();

        // nodes group
            let nodes = svg.append("g")
                .attr("class", "nodes")
                .selectAll("g.node")
                .data(data);
                
            let nodeEnter = nodes.enter()
                .append("g")
                .attr("class", "node")
                .attr("transform", function(d) { return "translate(" + d.x + "," + (d.y) + ")"; });

        // images
                nodeEnter
                    .append("pattern")
                    .attr("id", function(d) {return d.id})
                        .attr("height", "30px")
                        .attr("width", "30px")
                    .append("image")                
                        .attr('class', 'image thumb')
                        .attr("xlink:href", d => { return `images/thumb_${d.media[0]}.jpeg` })
                        .attr("width", "200px")
                        .attr("height", "200px")
                        .attr("x", -78)
                        .attr("y", -80) 
                        .style("opacity", 0.8)
        
        // links and circles
                nodeEnter
                    .append("a")                        
                    .attr("xlink:href", d => d.record_link)
                    .attr("target", "_blank")
                    .append("circle")
                        .attr("class", "shadow circle")
                        .attr("r", d => 20)
                    .attr("fill", d => ("url(#" + d.id + ")"))               

                    .on("mouseover", (event, d) => this.mouseover(event, d))
                    .on("mouseout", () =>  {
                        d3.selectAll("#viz circle")
                            .attr("stroke", "none");

                        d3.select("#tooltip").style("display", "none");

                    })
                    .on("click", (event, d) => this.activeCell = d);     

        },
        mouseover(event, d) {
            let ttpHeight =  d3.select("#tooltip").node().getBoundingClientRect().height ;
            let content = `
            <div class="align-center justify-center">
                <img src="images/thumb_${d.media[0]}.jpeg" class="thumb" alt="musuem image">
            </div>
            ${ d.date.source }<br><span class='artifact-title'>${ d.title }</span>`;

            d3.selectAll("#viz circle")
                .attr("stroke", "none");
                                
            d3.select(event.srcElement)
                .attr("stroke", "#999")

            d3.select("#tooltip")
                .style("display", "block")            
                .style("left", (event.pageX + 20) + "px")     
                .style("top", (event.pageY - (ttpHeight / 2)) + "px")            
                .html(content);
        },        
    }
}

</script>
