<style lang="sass">
  #viz
    line, path
      stroke: #333
    .yAxis .tick text
      color: #777
    .xAxis .tick text
      color: #ddd

    .xAxis path, .yAxis path
      stroke: #444
    .tick line
      stroke: #444
    

</style>
<template>
  <v-container>

    <v-card class="mt-5"  color="#222">
      <v-card-subtitle class="headline text-center mb-0 pb-0" style="color: #fff">
        Approval Ratings of President Biden for 2021 (in %)
      </v-card-subtitle>
      <h5 class="text-subtitle-2 text-center mt-0 pt-0" style="color: #999">
        Standard Deviation of Monthly Polling Data
      </h5>      

      <v-row align="center" justify="center">
        <v-checkbox
            class="mt-12 mr-6"
            dark
              v-model="checkbox"
              label="Show Polls Distribution"
              color="white"
              :value="false"
              hide-details
      ></v-checkbox>

        <v-checkbox
            v-if="checkbox"
            class="mt-12"
            dark
              v-model="checkboxSample"
              label="Scale Polls by Sample Size"
              color="white"
              :value="true"
              hide-details
      ></v-checkbox>

      </v-row>


      <div id="viz"></div>
    </v-card>

    <v-card class="mt-2 elevation-0" color="#222">
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
      ...mapState(['dataset', 'dataIsReady', 'sampleDataIsReady', 'sampleData']),
			svgHeight() {
				return this.height + this.margin.top + this.margin.bottom;
			},
      xScale() {
				const xScale = d3.scaleBand()
          .range([0, this.width])
          .domain(this.dataset.map(value => value.month_name )) 
          // .paddingInner(2.6)
          .padding(0.5);
				return xScale;
			},
			yScale() {
				const yScale = d3.scaleLinear()
					.range([this.height, 0])
					.domain([27, 70]);
				return yScale;
			}
    },
		data: () => ({
      // dataset = this.dataset,
			width: 760,
      height: 400,
			margin: {top: 10, right: 40, bottom: 40, left: 50},
			svg: Object,
      checkbox: false,
      checkboxSample: true,
      positiveColor: '#00C9A7',
      negativeColor: '#FF8066'
		}),    
    mounted() {
      if(this.dataIsReady && this.sampleDataIsReady) this.render()
    },
    watch: {
      dataIsReady: function() {
          if(this.dataIsReady && this.sampleDataIsReady) this.render()
      },
      sampleDataIsReady: function() {
          if(this.dataIsReady && this.sampleDataIsReady) this.render()
      },
      checkboxSample: function() {
        if(this.checkboxSample) {
          this.svg.selectAll('circle')
          .attr('r', 2)
          .transition()
          .duration(600)
          .attr('r', d => Math.sqrt(d['samplesize']) / 20)
        } else {
          this.svg.selectAll('circle')
          .attr('r', d => Math.sqrt(d['samplesize']) / 20) 
          .transition()
          .duration(300)
          .attr('r', 2)
        }
      },
      checkbox: function() {

        if(this.checkbox) {
          
          this.checkboxSample = true

          this.svg.append('g')
          .attr('class', "circle-group")
            .selectAll("circle")
            .data(this.sampleData.sort( (a, b) => a.month - b.month ))
            .enter()
            .append("circle")
            .attr("cy", this.height )							
              .transition()
              .duration(400)          
              .delay((d,i) => {
                // let thisMean = this.dataset.filter(e => e['month_name'] === d['month_name'])[0]['mean'];
                // let factor = d['approve'] % 2 == 0 ? 7 : 10
                return(i*3)}
              )            
            .attr('cx', d => this.xScale(d['month_name']) + this.xScale.bandwidth()/2)
            .attr('cy', d => this.yScale(d['approve']))
            .attr('r', d => Math.sqrt(d['samplesize']) / 20) 
            // .attr('r', d => Math.sqrt(d['samplesize']) / 20 )
            .attr('opacity', 0.05)
            .attr('fill', d => {
              let thisMean = this.dataset.filter(e => e['month_name'] === d['month_name'])[0]['mean'];
              return d['approve'] >= thisMean ? this.positiveColor : this.negativeColor
            })
            // .attr('fill', 'none')

        } else {
          this.svg.select('.circle-group').remove();
        }

      }     
    },

    methods: {

    render: function() {
        console.log('dataset from render', this.dataset);
        console.log('dataset from render', this.sampleData);

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
            .style('background', '#222')
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
                .call(d3.axisLeft(this.yScale))
                .call(g => g.select('path').remove());   
                

        // this.svg.append('g')
        //   .selectAll("circle")
        //   .data(this.sampleData)
        //   .enter()
        //   .append("circle")
        //   .attr('cx', d => this.xScale(d['month_name']) + this.xScale.bandwidth()/2)
        //   .attr('cy', d => this.yScale(d['approve']))
        //   .attr('r', d => Math.sqrt(d['samplesize']) / 20 )
        //   .attr('opacity', 0.05)
        //   .attr('fill', d => {
        //     let thisMean = this.dataset.filter(e => e['month_name'] === d['month_name'])[0]['mean'];
        //     return d['approve'] >= thisMean ? 'lightgreen' : 'coral'
        //   })
        //   // .attr('fill', 'none')


      let measures = ['min', 'mean', 'max']

      measures.forEach((m, index) => {
        const colors = [this.negativeColor, '#ddd', this.positiveColor]

        this.svg
          .append('g')
          .attr("class", m)
          .selectAll("rect")
          .data(dataset)
          .enter()
          .append("rect")
            .attr("x", (d, i) => this.xScale(d.month_name))
            // .attr("y", height )							
            //   .transition()
            //   .duration(400)          
            //   .delay(function(d,i){return(i*60)})
            .attr("y", d => {
                let start = m == 'max' ? 'max' : 'mean'
                return  this.yScale(d[m]) //this.yScale(d[start])
            })
            .attr("width", this.xScale.bandwidth())
            .attr("height", d => {
              return m === 'mean' ? 3 : 1
              // if(m == 'mean'){
              //   return 2
              // } else if(m == 'min') {
              //   return this.height - this.yScale(d['mean'] - d['min'])
              // } else if(m == 'max') {
              //   return this.height - this.yScale(d['max'] - d['mean'])
              // }
            })
            .attr("fill", colors[index])
            .style('opacity', d => {
              // let pos = d['count_std_1_pos'] + d['count_std_2_pos'] + d['count_std_3_pos']
              // let neg = d['count_std_1_neg'] + d['count_std_2_neg'] + d['count_std_3_neg']

              // if(m === 'min') {
              //   return neg / d['count']
              // } else if (m === 'max') {
              //   return pos / d['count']
              // } else {
              //   return 1
              // }

            });    
            

      });

                  
        this.svg.append('g')
          .attr("class", 'text')
          .selectAll("text")
          .data(dataset)
          .enter()
          .append("text")
          .attr('x', d => this.xScale(d['month_name']))
          .attr('y', d => this.yScale(d['max'] + 0.3))
          .attr('dx', d => 2)
          // .text(d => d['count_std_1_pos'] + d['count_std_2_pos'] + d['count_std_3_pos'])
          .text(d => `max: ${d.max}`)           
          .style('font-size', '6pt')
          .attr('fill', '#666')

        this.svg.append('g')
          .attr("class", 'text')
          .selectAll("text")
          .data(dataset)
          .enter()
          .append("text")
          .attr('x', d => this.xScale(d['month_name']))
          .attr('y', d => this.yScale(d['min'] - 1.2))
          .attr('dx', d => 2)
          // .text(d => d['count_std_1_neg'] + d['count_std_2_neg'] + d['count_std_3_neg'])
          .text(d => `min: ${d.min}`) 
          .style('font-size', '6pt')
          .attr('fill', '#666')


        this.svg.append('g')
          .attr("class", 'text')
          .selectAll("text")
          .data(dataset)
          .enter()
          .append("text")
          .attr('x', d => this.xScale(d['month_name']))
          .attr('y', d => this.yScale(d['mean'] - 1.5))
          .attr('dx', d => 6)
          .text(d => `µ: ${parseInt(d.mean)}`) 
          .style('font-size', '6pt')
          .attr('fill', '#666')


                
      // let mean = this.svg
      //     .append('g')
      //     .attr("class", "mean")
      //     .selectAll("rect")
      //     .data(dataset)
      //     .enter()
      //     .append("rect")
      //       .attr("x", (d, i) => this.xScale(d.month_name))
      //       // .attr("y", height )							
      //         // .transition()
      //         // .duration(400)          
      //         // .delay(function(d,i){return(i*6)})
      //       .attr("y", d => this.yScale(d.mean))
      //       .attr("width", this.xScale.bandwidth())
      //       .attr("height", d => 2)
      //       .attr("fill", 'black')
      //       .style('opacity', 1);



    },

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
