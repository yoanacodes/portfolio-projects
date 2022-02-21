<style lang="sass">
    h3
        text-align: center
        font-weight: 300
       
    .xAxis, .yAxis
        line, path
            stroke: #fff
        text
            font-size: 10pt
            fill: #fff

    #legend
        min-height: 30px
        text-align: center

    .legendItem
        margin-right: 10px
        margin-top: 20px
        
        .square
            display: inline-block
            width: 10px
            height: 10px
            background-color: pink
            margin: 0 5px 0 0 

        span
            font-size: 10pt
</style>

<template>
    <v-row align="center" justify="center" class="mt-12">
        <v-col cols="12" xs="12" md="12" lg="10" xl="8" id="viz" class="mb-12">

            <h3 class="mb-3">{{ selectedQuestion.label }}</h3>

            <div id="legend" class="mt-0 mb-0" >          
                <template v-if="hasDemographics">
                    <span class="legendItem" v-for="(label, i) in getLegendLabels" :key="i">
                        <span style="display: inline-block">
                            <span class="square" :style='{ backgroundColor: getLegendColor(label) }'></span>
                            <span>{{label}}</span>
                        </span>
                    </span>
                </template>
            </div>
        </v-col>
    </v-row>
</template>

<script>
import * as d3 from 'd3';
import * as _ from 'underscore';
import { mapState, mapGetters } from 'vuex';

  export default {
    name: 'Bar',

    data: function() {
      return {
      }
    },
    computed: {
        ...mapState(['selectedQuestion', 'selectedDemographics', 'answers']),
        ...mapGetters(['getGroupedData']),
        getLegendLabels: function() {
          
            return _.chain(this.getGroupedData)
                .pluck('values')
                .flatten()
                .pluck('label')
                .uniq()
                .sortBy()
                .value();
        },
        hasDemographics: function() {
            return this.selectedDemographics && typeof this.selectedDemographics != 'function';
        },
        dataIsReady: function() {
            return this.getGroupedData && this.getGroupedData.length ? true : false;
        },
    },
    mounted() {
        if(this.dataIsReady) this.render(this.getGroupedData)
    },
    watch: {
        dataIsReady: function() {
            this.render(this.getGroupedData);
        },
        selectedQuestion: function() {
            if(!this.dataIsReady) return
            
            if(this.hasDemographics) {
                this.render_grouped(this.getGroupedData);
            } else {
                this.render(this.getGroupedData);
            }            
        },
        selectedDemographics: function() {
            if(this.hasDemographics) {
                this.render_grouped(this.getGroupedData);
            } else {
                this.render(this.getGroupedData);
            }
        }
    },
    methods: {

        render: function(data) {

            if(!this.dataIsReady) return 

            d3.select("#viz svg").remove();

            const margin = {top: 20, right: 20, bottom: 30, left: 40},
                width = 960 - margin.left - margin.right,
                height = 400 - margin.top - margin.bottom;

            const svgW = width + margin.left + margin.right;
            const svgH = height + margin.top + margin.bottom;

            const svg = d3.select("#viz")
                .append("svg")
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", `0 0 ${svgW} ${svgH}`)
                .classed("svg-content", true)
                .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")")

            // set the ranges
            const xScale = d3.scaleBand()
                    .range([0, width])
                    .domain(data.map(d => d.label))
                    .padding([0.5]);

            const maxDomain = d3.max(data, d => d.value) > 45 ? d3.max(data, d => d.value) : 45;

            const yScale = d3.scaleLinear()
                    .range([height, 0])
                    .domain([0, maxDomain]);
            
            const that = this;

            // add the x Axis
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .attr("class","xAxis")
                .call(d3.axisBottom(xScale))

            // add the y Axis
            svg.append("g")
                .attr("class","yAxis")
                .call(d3.axisLeft(yScale))
                .call(g => g.selectAll('text').text(d => d + '%'))


            // append the rectangles for the bar chart
            svg.selectAll("rect")
                .data(data)
                .enter()
                .append("rect")
                    .attr("class", "bar")
                    .attr("x", d => xScale(d.label))
                    .attr("width", xScale.bandwidth())
                    .attr("y", d => yScale(d.value))
                    .attr("height", d => height - yScale(d.value))
                    .attr("fill", "#f0f8ff")
                    .attr('stroke', '#222')
                        .on("mouseenter", this.tooltipIn)                        
                        .on("mousemove", function(event, d) {                        
                            let ttpText = `
                                <span style="font-weight: 600"> ${d.label} </span>
                                <strong> ${d.value}%</strong> of prompt respondents
                                <span>(${d.rowValue} respondents)</span>
                                `;

                            d3.select(this).transition().duration(100).style('opacity', 1)

                            that.tooltipMove(event, ttpText);

                        })
                        .on("mouseleave", this.tooltipOut);

    },
    render_grouped: function(grouped_data) {

        if(!this.dataIsReady) return 

        d3.select("#viz svg").remove();

        const margin = {top: 20, right: 20, bottom: 30, left: 40},
                width = 960 - margin.left - margin.right,
                height = 400 - margin.top - margin.bottom;

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

        const labels = [];
              grouped_data.forEach(d => labels.push(d.label));

        const counts = [];
              grouped_data.forEach(d => d.values.forEach(count => counts.push(+count.value)));

        const demographics = [];
              grouped_data.forEach(d => d.values.forEach(demographic => demographics.push(demographic.label)));

        const xScale = d3.scaleBand()
                            .range([0, width])
                            .domain(labels)
                            .padding([this.getLegendLabels.length > 5 ? 0.2 : 0.5]);

        const maxDomain = d3.max(counts) > 45 ? d3.max(counts) : 45;

        const yScale = d3.scaleLinear()
                            .range([height, 0])
                            .domain([0, maxDomain]);

        // Another scale for subgroup position
        let xSubgroup = d3.scaleBand()
                              .range([0, xScale.bandwidth() ])
                              .padding([0.01])

        // add the x axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class","xAxis")
            .call(d3.axisBottom(xScale));

        // add the y axis
        svg.append("g")
            .attr("class","yAxis")
            .call(d3.axisLeft(yScale))
            .call(g => g.selectAll('text').text(d => d + '%'));

        // cache reference for mousemove this 
        const that = this;

        grouped_data.forEach(subset => {
        
            let group = svg
                    .append("g")
                    .attr("transform", `translate(${xScale(subset.label)}, 0)`);

                    // update the domain for each group
                    xSubgroup.domain(_.uniq(subset.values.map(d => d.label)));

                    group.selectAll('.bar')
                        .data(subset.values)
                        .enter()
                        .append('rect')
                        .attr('class', 'bar')
                        .attr("x", d => xSubgroup(d.label))
                        .attr("y", d => yScale(d.value))
                        .attr("width", xSubgroup.bandwidth())
                        .attr("height", d => height - yScale(d.value))
                        .attr("fill", d => this.getLegendColor(d.label))
                        .attr('stroke', '#222')
                        .on("mouseenter", this.tooltipIn)                        
                        .on("mousemove", function(event, d)  {       
                            let ttpDisplayVal = '';
                            let demographicLabel = that.selectedDemographics.btn_label;

                            if(demographicLabel === 'Age') {
                                ttpDisplayVal = `${d.label} years old respondents`;
                            } else if(demographicLabel === 'Family size') {
                                ttpDisplayVal = ` family of ${d.label} respondents`;
                            } else if(demographicLabel === 'Voted') {
                                d.label == 'Yes' ? ttpDisplayVal = ' respondents who voted' :  ttpDisplayVal = " respondents who didn't vote";
                            } else if(demographicLabel === 'English native') {
                                d.label == 'Yes' ? ttpDisplayVal = ` native respondents` :  ttpDisplayVal = ` non-native respondents`;
                            } else {
                                ttpDisplayVal = `${d.label} respondents`;
                            }

                            let ttpText = `
                                <span> ${demographicLabel}: ${d.label}</span>
                                <span style="font-weight: 600">${d.value}% (${d.rowValue} ${ d.rowValue === 1 ? 'person' : 'people' }) of <i>${ttpDisplayVal}</i> 
                                 said 
                                <strong>"${subset.label}"</strong> </span>

                                `;

                            d3.select(this).transition().duration(100).style('opacity', 1)

                            that.tooltipMove(event, ttpText);

                        })
                        .on("mouseleave", this.tooltipOut);
            });

        },
        tooltipIn: function() {
            d3.selectAll('.bar').transition().duration(100).style('opacity', 0.3);

            const ttp = d3.select('#tooltip');
                  ttp.style("display", "block");

        },
        tooltipMove: function(event, ttpText) {

            const ttp = d3.select('#tooltip');

            const ttpHeight =  ttp.node().getBoundingClientRect().height;
            const ttpWidth =  ttp.node().getBoundingClientRect().width;

                ttp
                    .style("left", (event.pageX + 20) + "px")     
                    .style("top", (event.pageY - (ttpHeight + 20)) + "px")     
                    .html(ttpText);            
        },
        tooltipOut: function() {
            d3.selectAll('.bar').transition().duration(300).style('opacity', 1);

            const ttp = d3.select('#tooltip');
                  
                  ttp.style("display", "none");
        },        
        getLegendColor: function(label) {
            let colors = d3.scaleOrdinal()
                            .domain(this.getLegendLabels)
                            .range(['#7bc434', '#19beb2', '#2d6e83', '#d95eae', '#6d5ad4', '#573f84', '#5f5c89', '#4aa398', '#1c627f'])
                            // .range(['#DAA1CD', '#9ADCDA', '#AAD927', '#FFD440', '#DF725A', '#3FDFD3', '#FFC0CB', '#57FF9A', '#FBFF27'])
            
            return colors(label);
        },        
    }
  }
</script>
