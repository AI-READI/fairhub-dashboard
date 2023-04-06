/*
Imports
*/

import * as D3 from "D3";
import Chart from "../chart.js";
import Legend from "../legend.js";

/*
Line Chart Class
*/

class LineChart extends Chart {

  // References
  mapped      = undefined;
  groups      = undefined;
  series      = undefined;
  color       = undefined;
  x           = undefined;
  y           = undefined;
  xAxis       = undefined;
  yAxis       = undefined;
  line        = undefined;
  series      = undefined;
  points      = undefined;
  annotation  = undefined;

  // Initialization
  constructor (config) {

    // Configure Parent
    super(config);

    // Configure Line Chart
    this.opacity      = config.opacity;
    this.legend       = config.legend;
    this.pointradius  = config.pointradius;

    // Computed References
    this.padding = {
      top: 0, left: 20, bottom: 0, right: 20
    };

    return this;

  }

  // Update
  update () {

    /*
    Setup
    */

    // Map Data
    [this.mapped, this.groups, this.series] = this.#mapData(this.data);

    this.svg = D3.select(this.id)
      .classed("line-chart", true);

    /*
    Generate Axes
    */

    this.x = D3.scaleTime()
      .domain(D3.extent(this.mapped, d => d[this.accessors.x.key]))
      .range([0, this.inner.width]);

    this.y = D3.scaleLinear()
      .domain([0, D3.max(this.mapped, d => d[this.accessors.y.key])])
      .range([this.inner.height, 0]);

    this.xAxis = this.svg.append("g")
      .classed("x-axis", true)
      .attr("id", `x-axis_${this.uid}`)
      .attr("transform", `translate(${this.margin.left}, ${this.inner.height + this.margin.top})`)
      .call(D3.axisBottom(this.x).tickSizeOuter(5).tickPadding(10));

    this.yAxis = this.svg.append("g")
      .classed("y-axis", true)
      .attr("id", `y-axis_${this.uid}`)
      .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
      .call(D3.axisLeft(this.y));

    this.color = D3.scaleOrdinal()
      .domain(this.groups)
      .range(this.palette);

    /*
    Generate Data Elements
    */

    this.line = D3.line()
        .x(d => this.x(d[this.accessors.x.key]))
        .y(d => this.y(d[this.accessors.y.key]));

    this.lines = this.svg
      .append("g")
      .classed("series", true)
      .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
      .selectAll(".line")
        .data(this.series)
        .join("path")
          .classed("line", true)
          .attr("fill", "none")
          .attr("stroke", d => this.color(d[this.accessors.color.key]))
          .attr("stroke-width", 2)
          .attr("d", d => this.line(d.values));

    this.points = this.svg
      .append("g")
      .classed("points", true)
      .attr("transform", `translate(${this.margin.left}, ${this.margin.bottom})`)
      .selectAll(".points")
      .data(this.series)
      .join("g")
        .classed("points", true)
        .attr("id", d => `points_${this.uid}_${this.tokenize(d.group)}`)
        .attr("fill", d => this.color(d[this.accessors.color.key]))
        .attr("stroke", d => this.color(d[this.accessors.color.key]))
        .selectAll(".point")
          .data(d => d.values)
          .join("circle")
            .classed("point", true)
            .attr("cx", d => this.x(d[this.accessors.x.key]))
            .attr("cy", d => this.y(d[this.accessors.y.key]))
            .attr("r", this.pointradius)
            .attr("id", d => `point_${this.uid}_${this.tokenize(d.group)}}`);

    /*
    Annotation
    */

    this.annotation = new Legend({
      uid       : this.uid,
      parent    : this.svg,
      container : this.inner,
      data      : this.series,
      color     : this.color,
      width     : this.legend.width,
      height    : this.legend.height,
      margin    : this.margin,
      padding   : this.padding,
      itemsize  : this.legend.itemsize,
      fontsize  : this.legend.fontsize,
      vposition : this.legend.vposition,
      hposition : this.legend.hposition,
      accessor  : this.accessors.color.key
    });

    return this;

  }

/*
Map Data and Set Value Types
*/

  #mapData (data) {

    let mapped = [];
    data.forEach(row => {
      mapped.push({
        [this.accessors.x.key]      : super.asType(this.accessors.x.type, row[this.accessors.x.key]),
        [this.accessors.y.key]      : super.asType(this.accessors.y.type, row[this.accessors.y.key]),
        [this.accessors.color.key]  : super.asType(this.accessors.color.type, row[this.accessors.color.key])
      });
    });

    let groups = super.getUniqueKeys(mapped, this.accessors.color.key);

    let series = groups.map(
      key => ({
        group: key,
        values: mapped.filter(
          d => d[this.accessors.color.key] == key
        ).map(
          d => ({
            [this.accessors.x.key]: d[this.accessors.x.key],
            [this.accessors.y.key]: d[this.accessors.y.key]
          })
        )
      })
    );

    return [mapped, groups, series];

  }

}

/*
Exports
*/

export default LineChart;
