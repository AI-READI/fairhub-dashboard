/*
Imports
*/

import * as D3 from "d3";
import Chart from "../chart.js";
import Legend from "../legend.js";

/*
Stacked Bar Chart Class
*/

class StackedBarChart extends Chart {

  // References
  groups    = undefined;
  subgroups = undefined;
  stacked   = undefined;
  color     = undefined;
  x         = undefined;
  y         = undefined;
  xAxis     = undefined;
  yAxis     = undefined;
  bars      = undefined;

  constructor (config) {

    // Configure Parent
    super(config);

    // Configure Stacked Bar Chart
    this.opacity      = config.opacity;
    this.legend       = config.legend;
    this.accessors    = config.accessors;

    // Computed References
    this.padding      = {
      top: 0, left: 20, bottom: 0, right: 20
    }

  }

  update () {

    /*
    Setup
    */

    this.svg = D3.select(this.id)
      .classed("stacked-bar-chart", true);

    this.groups = super.getUniqueKeys(this.data, this.accessors.x.key);
    this.subgroups = super.getUniqueKeys(this.data, this.accessors.color.key);
    this.data = this.#mapData(this.data);

    this.stacked = D3.stack()
      .keys(this.subgroups)
      .value((d, key) => {
        d.subgroup = key;
        return d.values[key];
      })(this.data);

    this.color = D3.scaleOrdinal()
      .domain(this.groups)
      .range(this.palette);

    /*
    Generate Axes
    */

    this.x = D3.scaleBand()
      .domain(this.groups)
      .range([0, this.inner.width])
      .paddingInner(0.05)
      .paddingOuter(0)
      .align(0);

    this.y = D3.scaleLinear()
      .domain([0, 750])
      .range([this.inner.height, 0]);

    this.xAxis = this.svg.append("g")
      .classed("x-axis", true)
      .attr("id", `x-axis_${this.uid}`)
      .attr("transform", `translate(${this.margin.left}, ${this.inner.height + this.margin.top})`)
      .call(D3.axisBottom(this.x).tickSizeOuter(5).tickPadding(10))
      .selectAll(".tick")
        .data(this.data)
        .attr("transform", d => `translate(${this.x(d[this.accessors.x.key])}, 0)`)
        .selectAll("text")
          .attr("id", d => `label_${this.uid}_${this.tokenize(d[this.accessors.x.key])}`)
          .classed("label", true)
          .style("text-anchor", "start")
          .style("text-transform", "capitalize");

    this.yAxis = this.svg.append("g")
      .classed("y-axis", true)
      .attr("id", `y-axis_${this.uid}`)
      .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
      .call(D3.axisLeft(this.y))
      .selectAll("text")
        .classed("label", true)
        .style("text-anchor", "end")
        .style("text-transform", "capitalize");

    /*
    Generate Data Elements
    */

    this.bars = this.svg.append("g")
      .classed(`bars`, true)
      .attr("id", `bars_${this.uid}`)
      .attr("transform", `translate(${this.margin.left}, ${this.margin.bottom})`)
      .selectAll(".bar-group")
      .data(this.stacked)
      .join("g")
        .classed("bar-group", true)
        .attr("id", d => `bar-group_${this.uid}_${this.tokenize(d.group)}`)
        .attr("fill", d => this.color(d.key))
        .selectAll("rect")
        .data(d => d)
        .enter()
          .append("rect")
          .attr("id", d => `bar_${this.uid}_${this.tokenize(d.data.group)}_${this.tokenize(d.data.subgroup)}`)
          .classed("bar", true)
          .attr("x", d => this.x(d.data.group))
          .attr("y", d =>  this.y(d[1]))
          .attr("height", d =>  this.y(d[0]) - this.y(d[1]))
          .attr("width", this.x.bandwidth())
          .attr("opacity", this.opacity)
          .text(d =>  d.data.group);

    /*
    Annotation
    */

    this.annotation = new Legend({
      uid: this.uid,
      parent: this.svg,
      container: this.inner,
      data: this.stacked,
      color: this.color,
      width: this.legend.width,
      height: this.legend.height,
      margin: this.margin,
      padding: this.padding,
      itemsize: this.legend.itemsize,
      fontsize: this.legend.fontsize,
      vposition: this.legend.vposition,
      hposition: this.legend.hposition,
      accessor: "key"
    });

  }

  #mapData (data) {
    let mapped = [];
    let groups = super.getUniqueKeys(data, this.accessors.x.key);

    groups.forEach(group => {
      let stack = {
        group: group,
        values: {}
      };
      data.forEach(row => {
        if (row[this.accessors.x.key] === group) {
          stack.values[super.asType(this.accessors.color.type, row[this.accessors.color.key])] = super.asType(this.accessors.y.type, row[this.accessors.y.key])
        }
      });
      mapped.push(stack);
    });

    return mapped;

  }

}

/*
Exports
*/

export default StackedBarChart;
