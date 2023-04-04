/*
Imports
*/

import * as D3 from "D3";
import Chart from "./chart.js";
import Legend from "./legend.js";

class LineChart extends Chart {

  // References
  groups  = null;
  series  = null;
  color   = null;
  x       = null;
  y       = null;
  xAxis   = null;
  yAxis   = null;
  line    = null;
  series  = null;
  points  = null;

  // Initialization
  constructor (config) {
    super(config)
    this.data         = config.data;
    this.opacity      = config.opacity;
    this.ncols        = config.ncols; 
    this.legend       = config.legend;
    this.pointradius  = config.pointradius;
    this.accessors    = config.accessors;

    this.padding = {
      top: 0, left: 20, bottom: 0, right: 20
    }
  }

  // Update
  update () {

    /*
    Setup
    */

    this.svg = D3.select(this.id)
      .classed("line-chart", true);

    this.data = this.mapData(this.data);

    // We need to compute these
    this.groups = ['normal', 'prediabetic', 'diabetic'];

    this.series = this.groups.map(
      key => ({
        group: key,
        values: this.data.filter(
          d => d[this.accessors.color.key] == key
        ).map(
          d => ({
            [this.accessors.x.key]: d[this.accessors.x.key],
            [this.accessors.y.key]: d[this.accessors.y.key]
          })
        )
      })
    );

    console.log(this.series)

    this.color = D3.scaleOrdinal()
      .domain(this.groups)
      .range(this.palette);

    /*
    Generate Axes
    */

    this.x = D3.scaleTime()
      .domain(D3.extent(this.data, d => d[this.accessors.x.key]))
      .range([0, this.inner.width]);

    this.y = D3.scaleLinear()
      .domain([0, D3.max(this.data, d => d[this.accessors.y.key])])
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
      .selectAll(".points")
      .data(this.series)
      .join("g")
        .classed("points", true)
        .attr("id", d => `points_${this.uid}_${this.tokenize(d.group)}`)
        .attr("fill", d => this.color(d[this.accessors.color.key]))
        .attr("stroke", d => this.color(d[this.accessors.color.key]))
        .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
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
      accessor  : "group"
    });

    return this;

  }

  mapData (data) {
    let mapped = []
    data.forEach(row => {
      mapped.push({
        [this.accessors.x.key]      : this.asType(this.accessors.x.type, row[this.accessors.x.key]),
        [this.accessors.y.key]      : this.asType(this.accessors.y.type, row[this.accessors.y.key]),
        [this.accessors.color.key]  : this.asType(this.accessors.color.type, row[this.accessors.color.key])
      })
    });
    return mapped;
  }

}

/*
Exports
*/

export default LineChart;
