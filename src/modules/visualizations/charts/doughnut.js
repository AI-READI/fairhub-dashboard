/*
Imports
*/

import * as D3 from "d3";
import Chart from "../chart.js";
import Legend from "../interfaces/legend.js";
import Tooltip from "../interfaces/tooltip.js";
import Filters from "../interfaces/filters.js";
import Easing from "../animations/easing.js";

/*
Doughnut Chart Class
*/

class DoughnutChart extends Chart {

  constructor (config) {

    // Configure Parent
    super(config);

    let self = this;

    return self.update();

  }

  update () {

    let self = this;

    /*
    Setup
    */


    // Unique Groups
    self.groups = super.getUniqueValuesByKey(self.data, self.accessors.group.key);

    // Color Scale
    self.colorscale = D3.scaleOrdinal()
      .domain(self.groups)
      .range(self.palette);

    // Map Data
    self.mapping = self.#mapData(self.data);

    // Grab SVG Generated From Vue Template
    self.svg = D3.select(`${self.id}_visualization`)
      .classed("doughnut-chart", true);

    /*
    Generate Axes
    */

    self.color = D3.scaleOrdinal()
      .domain(self.groups)
      .range(self.palette);

    /*
    Generate Data Elements
    */

    self.radius = (Math.min(self.dataframe.width, self.dataframe.height) / 2);

    self.doughnut = D3.pie()
      .value(d => d.value)(self.mapping.data)
      .map(d => {
        d["label"] = d.data[self.accessors.color.key];
        return d;
      });

    self.dataArc = D3.arc()
      .innerRadius(self.radius * 0.5)
      .outerRadius(self.radius * 0.8);

    self.arcs = self.svg
      .append("g")
      .classed("data-arcs", true)
      .attr("id", `${self.setID}_data-arcs`)
      .attr("transform", `translate(${self.dataframe.width / 2}, ${self.dataframe.height / 2})`)
      .selectAll('.data-arc')
        .data(self.doughnut)
        .join("path")
          .classed("data-arc", true)
          .attr("id", d => `${self.setID}_data-arc_${self.tokenize(d.group)}`)
          .attr("d", self.dataArc)
          .attr('fill', d => self.color(d.label))
          .attr("stroke-width", "2px")
          .attr("opacity", self.opacity)

    /*
    Generate Text Labels
    */

    self.labelArc = D3.arc()
      .innerRadius(self.radius * 0.85)
      .outerRadius(self.radius * 0.90);

    self.labelLines = self.svg
      .append("g")
      .classed("label-lines", true)
      .attr("id", `${self.setID}_label-lines`)
      .attr("transform", `translate(${self.dataframe.width / 2}, ${self.dataframe.height / 2})`)
      .selectAll('.label-line')
        .data(self.doughnut)
        .enter()
        .append('polyline')
          .classed("label-line", true)
          .attr("id", d => `${self.setID}_label-line_${self.tokenize(d.group)}`)
          .attr("stroke", "black")
          .attr("fill", "none")
          .attr("stroke-width", 1)
          .attr('points', d => self.#setLabels(d))

    self.labels = self.svg
      .append("g")
      .classed("labels", true)
      .attr("id", d => `${self.setID}_labels`)
      .attr("transform", `translate(${self.dataframe.width / 2}, ${self.dataframe.height / 2})`)
      .selectAll('.label')
        .data(self.doughnut)
        .enter()
        .append('text')
          .text(d => d.data[self.accessors.color.key])
          .classed("label", true)
          .attr("id", d => `${self.setID}_label_${self.tokenize(d.group)}`)
          .attr('transform', d => `translate(${self.radius * 0.95 * ((d.startAngle + (d.endAngle - d.startAngle) / 2) < Math.PI ? 1 : -1)}, ${self.labelArc.centroid(d)[1]})`)
          .attr('font-size', "0.6rem")
          .style('text-anchor', d => ((d.startAngle + (d.endAngle - d.startAngle) / 2) < Math.PI ? 'start' : 'end'))
          .style("text-transform", "capitalize");

    return self;

  }

  #setLabels (d) {

    let self = this;
    let x = self.dataArc.centroid(d); // line insertion in the slice
    let y = self.labelArc.centroid(d); // line break: we use the other arc generator that has been built only for that
    let z = self.labelArc.centroid(d); // Label position = almost the same as posB
    let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2; // we need the angle to see if the X position will be at the extreme right or extreme left

    z[0] = self.radius * 0.9 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left

    return [x, y, z];

  }

  #mapData (data) {

    let self = this;
    let groups = [];
    let colors = [];
    let legend = [];

    // Get Unique Groups
    groups.push(...super.getUniqueValuesByKey(data, this.accessors.color.key));

    // Remap Values from Accessor Keys to Fixed Keys
    data = data.map(datum => {
      return {
        group: datum[self.accessors.group.key],
        value: datum[self.accessors.value.key],
        color: self.colorscale(datum[self.accessors.color.value])
      }
    });

    // Get Unique Colors
    colors.push(...super.getUniqueValuesByKey(data, "color"));

    // Generate Legend
    legend.push(...D3.zip(self.groups, colors)
      .map(([group, color]) => {
        return {
          group: group,
          color: color
        }
      })
    );

    return {
      data: data,
      groups: groups,
      colors: colors,
      legend: legend
    }

  }

}

/*
Exports
*/

export default DoughnutChart;
