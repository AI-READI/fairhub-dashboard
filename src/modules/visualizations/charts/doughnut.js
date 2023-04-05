/*
Imports
*/

import * as D3 from "d3";
import Chart from "../chart.js";

/*
Doughnut Chart Class
*/

class DoughnutChart extends Chart {

  // References
  groups    = undefined;
  radius    = undefined;
  doughnut  = undefined;
  color     = undefined;
  dataArc   = undefined;
  labelArc  = undefined;
  arcs      = undefined;

  constructor (config) {

    // Configure Parent
    super(config);

    // Configure Stacked Bar Chart
    this.opacity      = config.opacity;

  }

  update () {

    this.svg = D3.select(this.id)
      .classed("doughnut-chart", true);

    this.data = this.#mapData(this.data);
    this.radius       = (Math.min(this.inner.width, this.inner.height) / 2);
    this.groups       = this.data.map(d => d.group);

    this.doughnut = D3.pie()
      .value(d => d[this.accessors.value.key])(this.data)
      .map(d => {
        d["label"] = d.data[this.accessors.group.key];
        return d;
      });

    this.color = D3.scaleOrdinal()
      .domain(this.groups)
      .range(this.palette);

    /*
    Generate Data Elements
    */

    this.dataArc = D3.arc()
      .innerRadius(this.radius * 0.5)
      .outerRadius(this.radius * 0.8);

    this.arcs = this.svg
      .append("g")
      .classed("data-arcs", true)
      .attr("transform", `translate(${this.inner.width / 2}, ${this.inner.height / 2})`)
      .selectAll('.data-arc')
        .data(this.doughnut)
        .join("path")
          .classed("data-arc", true)
          .attr("d", this.dataArc)
          .attr('fill', d => this.color(d.label))
          .attr("stroke-width", "2px")
          .attr("opacity", this.opacity)


      // .append("g")
      //   .attr("transform", `translate(${this.inner.width / 2}, ${this.inner.height / 2})`);


    /*
    Generate Text Labels
    */

    this.labelArc = D3.arc()
      .innerRadius(this.radius * 0.85)
      .outerRadius(this.radius * 0.90);

    this.labelLines = this.svg
      .append("g")
      .classed("label-lines", true)
      .attr("transform", `translate(${this.inner.width / 2}, ${this.inner.height / 2})`)
      .selectAll('.label-line')
        .data(this.doughnut)
        .enter()
        .append('polyline')
          .classed("label-line", true)
          .attr("stroke", "black")
          .attr("fill", "none")
          .attr("stroke-width", 1)
          .attr('points', d => this.#setLabels(d))

    this.labels = this.svg
      .append("g")
      .classed("labels", true)
      .attr("transform", `translate(${this.inner.width / 2}, ${this.inner.height / 2})`)
      .selectAll('.label')
        .data(this.doughnut)
        .enter()
        .append('text')
          .classed("label", true)
          .text(d => d.data[this.accessors.group.key])
          .attr('transform', d => `translate(${this.radius * 0.95 * ((d.startAngle + (d.endAngle - d.startAngle) / 2) < Math.PI ? 1 : -1)}, ${this.labelArc.centroid(d)[1]})`)
          .attr('font-size', "0.6rem")
          .style('text-anchor', d => ((d.startAngle + (d.endAngle - d.startAngle) / 2) < Math.PI ? 'start' : 'end'))
          .style("text-transform", "capitalize");

    return this;
  }

  #setLabels (d) {
    let x = this.dataArc.centroid(d), // line insertion in the slice
        y = this.labelArc.centroid(d), // line break: we use the other arc generator that has been built only for that
        z = this.labelArc.centroid(d), // Label position = almost the same as posB
        midangle = d.startAngle + (d.endAngle - d.startAngle) / 2; // we need the angle to see if the X position will be at the extreme right or extreme left
        z[0] = this.radius * 0.9 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
    return [x, y, z];
  }

  #mapData (data) {

    let mapped = []

    data.forEach(row => {
      mapped.push({
        [this.accessors.group.key]  : super.asType(this.accessors.group.type, row[this.accessors.group.key]),
        [this.accessors.value.key]  : super.asType(this.accessors.value.type, row[this.accessors.value.key])
      })
    });

    return mapped;

  }

};

/*
Exports
*/

export default DoughnutChart;
