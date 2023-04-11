/*
Imports
*/

import * as D3 from "d3";
import Chart from "../chart.js";
import Legend from "../utilities/legend.js";

/*
Stacked Bar Chart Class
*/

class StackedBarChart extends Chart {

  // References
  mapped      = undefined;
  groups      = undefined;
  subgroups   = undefined;
  stacked     = undefined;
  color       = undefined;
  x           = undefined;
  y           = undefined;
  xAxis       = undefined;
  yAxis       = undefined;
  bars        = undefined;
  annotation  = undefined;

  constructor (config) {

    // Configure Parent
    super(config);

    let self = this;

    // Configure Stacked Bar Chart
    self.opacity      = config.opacity;
    self.legend       = config.legend;
    self.accessors    = config.accessors;

    // Computed References
    self.padding      = {
      top: 0, left: 20, bottom: 0, right: 20
    };

    return self;

  }

  update () {

    let self = this;

    /*
    Setup
    */

    // Grab SVG Generated From Vue Template
    self.svg = D3.select(self.id)
      .classed("stacked-bar-chart", true);

    // Map Data
    [self.mapped, self.groups, self.subgroups] = self.#mapData(self.data);

    /*
    Generate Axes
    */

    self.x = D3.scaleBand()
      .domain(self.groups)
      .range([0, self.inner.width])
      .paddingInner(0.05)
      .paddingOuter(0)
      .align(0);

    self.y = D3.scaleLinear()
      .domain([0, 750])
      .range([self.inner.height, 0]);

    self.xAxis = self.svg.append("g")
      .classed("x-axis", true)
      .attr("id", `x-axis_${self.uid}`)
      .attr("transform", `translate(${self.margin.left}, ${self.inner.height + self.margin.top})`)
      .call(D3.axisBottom(self.x).tickSizeOuter(5).tickPadding(10))
      .selectAll(".tick")
        .data(self.mapped)
        .attr("transform", d => `translate(${self.x(d[self.accessors.x.key])}, 0)`)
        .selectAll("text")
          .attr("id", d => `label_${self.uid}_${self.tokenize(d[self.accessors.x.key])}`)
          .classed("label", true)
          .style("text-anchor", "start")
          .style("text-transform", "capitalize");

    self.yAxis = self.svg.append("g")
      .classed("y-axis", true)
      .attr("id", `y-axis_${self.uid}`)
      .attr("transform", `translate(${self.margin.left}, ${self.margin.top})`)
      .call(D3.axisLeft(self.y))
      .selectAll("text")
        .classed("label", true)
        .style("text-anchor", "end")
        .style("text-transform", "capitalize");

    self.color = D3.scaleOrdinal()
      .domain(self.groups)
      .range(self.palette);

    /*
    Generate Data Elements
    */

    self.stacked = D3.stack()
      .keys(self.subgroups)
      .value((d, key) => {
        d.subgroup = key;
        return d.values[key];
      })(self.mapped);

    console.log(self.stacked);

    self.bars = self.svg.append("g")
      .classed(`bars`, true)
      .attr("id", `bars_${self.uid}`)
      .attr("transform", `translate(${self.margin.left}, ${self.margin.bottom})`)
      .selectAll(".bar-group")
      .data(self.stacked)
      .join("g")
        .classed("bar-group", true)
        .attr("id", d => `bar-group_${self.tokenize(d[self.accessors.x.key])}_${self.uid}`)
        .attr("fill", d => self.color(d.key))
        .selectAll("rect")
        .data(d => d)
        .enter()
          .append("rect")
          .attr("id", d => `bar_${self.tokenize(d.data[self.accessors.x.key])}_${self.tokenize(d.data[self.accessors.color.key])}_${self.uid}`)
          .classed("bar", true)
          .attr("x", d => self.x(d.data[self.accessors.x.key]))
          .attr("y", d =>  self.y(d[1]))
          .attr("height", d =>  self.y(d[0]) - self.y(d[1]))
          .attr("width", self.x.bandwidth())
          .attr("opacity", self.opacity)
          .text(d =>  d.data[self.accessors.x.key]);

    /*
    Annotation
    */

    self.annotation = new Legend({
      uid: self.uid,
      parent: self.svg,
      container: self.inner,
      data: self.stacked,
      color: self.color,
      width: self.legend.width,
      height: self.legend.height,
      margin: self.margin,
      padding: self.padding,
      itemsize: self.legend.itemsize,
      fontsize: self.legend.fontsize,
      vposition: self.legend.vposition,
      hposition: self.legend.hposition,
      accessor: "key"
    });

    return self;

  }

  #mapData (data) {

    let self = this;
    let groups = super.getUniqueKeys(data, self.accessors.x.key);
    let subgroups = super.getUniqueKeys(self.data, self.accessors.color.key);
    let mapped = [];

    groups.forEach(group => {
      let stack = {
        group: group,
        values: {}
      };
      data.forEach(row => {
        if (row[self.accessors.x.key] === group) {
          stack.values[super.asType(self.accessors.color.type, row[self.accessors.color.key])] = super.asType(self.accessors.y.type, row[self.accessors.y.key]);
        }
      });
      mapped.push(stack);
    });

    return [mapped, groups, subgroups];

  }

}

/*
Exports
*/

export default StackedBarChart;
