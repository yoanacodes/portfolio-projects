<template>
  <v-container>

    <v-card class="mt-5">

      <v-card-subtitle class="headline text-center mb-0 pb-0" style="color: #333">
        Approval Ratings of President Biden for 2021
      </v-card-subtitle>
      <h5 class="text-subtitle-2 text-center mt-0 pt-0" style="color: #999">
        Standard Deviation of Monthly Polling Data
      </h5>      
      <div id="viz"></div>
    </v-card>

    <v-card class="mt-2 elevation-0">
      <v-card-title class="text-subtitle-1" style="color: #999">Legend</v-card-title>
      <v-card-text>
      </v-card-text>
    </v-card>

  </v-container>
    
</template>

<script>
import { mapState } from 'vuex';
import * as d3 from 'd3';


  export default {
    name: 'Bar',
    computed: {
      ...mapState(['dataset', 'dataIsReady']),
			svgHeight() {
				return this.height + this.margin.top + this.margin.bottom;
			},
      xScale() {
				const xScale = d3.scaleBand()
          .range([0, this.width])
          .domain(this.dataset.map(value => value.month_name )) 
          .paddingInner(0.6);
				return xScale;
			},
			yScale() {
				const yScale = d3.scaleLinear()
					.range([this.height, 0])
					.domain([0, 100]);
				return yScale;
			}
    },
    mounted() {
      if(this.dataIsReady) this.render_SD()
    },
    watch: {
      dataIsReady: function() {
          if(this.dataIsReady) this.render_SD()
      }
    },
		data: () => ({
      // dataset = this.dataset,
			width: 760,
      height: 400,
			margin: {top: 10, right: 40, bottom: 40, left: 50},
			svg: Object,
		}),
    methods: {
     render_SD: function() {
        // console.log('dataset from render', this.dataset);

        let dataset = this.dataset;
				let width = this.width;
				let svgHeight = this.svgHeight;
        let height = this.height;

        let svgWidth = width + this.margin.left + this.margin.right;

				this.svg = d3.select("#viz")
						.append("svg")
						.attr("preserveAspectRatio", "xMinYMin meet")
						.attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
						.classed("svg-content", true)
						.append("g")
							.attr("transform",
								"translate(" + this.margin.left + "," + this.margin.top + ")");

        // create axes
				this.svg.append("g")
                .attr("class", "xAxis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(this.xScale));

				this.svg.append("g")
                .attr("class","yAxis")
                .call(d3.axisLeft(this.yScale));

      let draw_std = (direction) => {
        let position_pos = ['std_1', 'std_2', 'std_3'];
        let position_neg = ['mean', 'std_1', 'std_2'];        

        let position = direction == 'pos' ? position_pos : position_neg

            position.forEach((std, index) => {
                this.svg
                  .append('g')
                  .attr("class", `${std}_${direction}` )        
                  .selectAll("rect")
                  .data(dataset)
                  .enter()
                  .append("rect")
                    .attr("x", (d, i) => this.xScale(d.month_name))
                    .attr("y", 0 )							
                      .transition()
                      .duration(400)          
                      .delay(function(d,i){return(i*850)})
                    .attr("y", d => {
                      let position = std == 'mean' ? 'mean' : `${std}_${direction}`
                      return this.yScale( d[position] ) 
                    })
                    .attr("width", this.xScale.bandwidth())
                    .attr("height", d => {
                      return this.height - this.yScale(d['std']) 
                    })
                    .attr("fill", 'blueviolet') 
                    .style('fill-opacity', d => {
                      let proportionKey = std === 'mean' ? 'count_std_1_neg' : `count_${std}_${direction}`
                      let proportion = (d[proportionKey] / d['count']) 

                      return proportion
                    })
                    .attr('stroke-opacity', '0.4')
                    .attr('stroke', '#ddd');

                    // x% (count) of polls for month fall within 1 standard deviation from the mean

            });
      }

      draw_std('pos')
      draw_std('neg')

      let mean = this.svg
        .append('g')
        .attr("class", "mean")
        .selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
          .attr("x", (d, i) => this.xScale(d.month_name))
          // .attr("y", height )							
            // .transition()
            // .duration(400)          
            // .delay(function(d,i){return(i*6)})
          .attr("y", d => this.yScale(d.mean))
          .attr("width", this.xScale.bandwidth())
          .attr("height", d => 2)
          .attr("fill", 'black')
          .style('opacity', 1)
        
      }
    }
  }
</script>
