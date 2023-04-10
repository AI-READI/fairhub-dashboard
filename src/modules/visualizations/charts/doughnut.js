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
  mapped    = undefined;
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

    let self = this;

    // Configure Stacked Bar Chart
    self.opacity      = config.opacity;

    return self.update();

  }

  update () {

    let self = this;

    /*
    Setup
    */

    self.svg = D3.select(self.id)
      .classed("doughnut-chart", true);

    [self.mapped, self.groups] = self.#mapData(self.data);

    self.color = D3.scaleOrdinal()
      .domain(self.groups)
      .range(self.palette);

    /*
    Generate Data Elements
    */

    self.radius = (Math.min(self.inner.width, self.inner.height) / 2);

    self.doughnut = D3.pie()
      .value(d => d[self.accessors.value.key])(self.mapped)
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
      .attr("id", `data-arcs_${self.uid}`)
      .attr("transform", `translate(${self.inner.width / 2}, ${self.inner.height / 2})`)
      .selectAll('.data-arc')
        .data(self.doughnut)
        .join("path")
          .classed("data-arc", true)
          .attr("id", d => `data-arc_${self.tokenize(d[self.accessors.color.key])}_${self.uid}`)
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
      .attr("id", `label-lines_${self.uid}`)
      .attr("transform", `translate(${self.inner.width / 2}, ${self.inner.height / 2})`)
      .selectAll('.label-line')
        .data(self.doughnut)
        .enter()
        .append('polyline')
          .classed("label-line", true)
          .attr("id", d => `label-line_${self.tokenize(d[self.accessors.color.key])}_${self.uid}`)
          .attr("stroke", "black")
          .attr("fill", "none")
          .attr("stroke-width", 1)
          .attr('points', d => self.#setLabels(d))

    self.labels = self.svg
      .append("g")
      .classed("labels", true)
      .attr("id", d => `labels_${self.uid}`)
      .attr("transform", `translate(${self.inner.width / 2}, ${self.inner.height / 2})`)
      .selectAll('.label')
        .data(self.doughnut)
        .enter()
        .append('text')
          .text(d => d.data[self.accessors.color.key])
          .classed("label", true)
          .attr("id", d => `label_${self.tokenize(d[self.accessors.color.key])}_${self.uid}`)
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
    let groups = super.getUniqueKeys(data, this.accessors.color.key);
    let mapped = [];

    data.forEach(row => {
      mapped.push({
        [self.accessors.color.key]: super.asType(self.accessors.color.type, row[self.accessors.color.key]),
        [self.accessors.value.key]: super.asType(self.accessors.value.type, row[self.accessors.value.key])
      })
    });

    return [mapped, groups];

  }

};

/*
Exports
*/

export default DoughnutChart;
