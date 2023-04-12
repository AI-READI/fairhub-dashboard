/*
Imports
*/

import * as D3 from "d3";
import Chart from "../chart.js";
import Legend from "../utilities/legend.js";
import Simulator from "../utilities/simulator.js";

const simulator = new Simulator();
console.log(simulator);

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

    let self = this;

    // Configure Line Chart
    self.opacity      = config.opacity;
    self.legend       = config.legend;
    self.pointradius  = config.pointradius;

    // Computed References
    self.padding = {
      top: 0, left: 20, bottom: 0, right: 20
    };

    return self;

  }

  // Update
  update () {

    let self = this;

    /*
    Setup
    */

    // Grab SVG Generated From Vue Template
    self.svg = D3.select(self.id)
      .classed("line-chart", true);

    // Map Data
    [self.mapped, self.groups, self.series] = self.#mapData(self.data);

    /*
    Generate Axes
    */

    self.x = D3.scaleTime()
      .domain(D3.extent(self.mapped, d => d[self.accessors.x.key]))
      .range([0, self.inner.width]);

    self.y = D3.scaleLinear()
      .domain([0, D3.max(self.mapped, d => d[self.accessors.y.key])])
      .range([self.inner.height, 0]);

    self.xAxis = self.svg.append("g")
      .classed("x-axis", true)
      .attr("id", `x-axis_${self.uid}`)
      .attr("transform", `translate(${self.margin.left}, ${self.inner.height + self.margin.top})`)
      .call(D3.axisBottom(self.x).tickSizeOuter(5).tickPadding(10));

    self.yAxis = self.svg.append("g")
      .classed("y-axis", true)
      .attr("id", `y-axis_${self.uid}`)
      .attr("transform", `translate(${self.margin.left}, ${self.margin.top})`)
      .call(D3.axisLeft(self.y));

    self.color = D3.scaleOrdinal()
      .domain(self.groups)
      .range(self.palette);

    /*
    Generate Data Elements
    */

    self.line = D3.line()
        .x(d => self.x(d[self.accessors.x.key]))
        .y(d => self.y(d[self.accessors.y.key]));

    self.lines = self.svg
      .append("g")
      .classed("lines", true)
      .attr("id", d =>`lines_${this.uid}`)
      .attr("transform", `translate(${self.margin.left}, ${self.margin.top})`)
      .selectAll(".line")
        .data(self.series)
        .join("path")
          .classed("line", true)
          .attr("id", d =>`line_${self.tokenize(d[self.accessors.color.key])}_${this.uid}`)
          .attr("fill", "none")
          .attr("stroke", d => self.color(d[self.accessors.color.key]))
          .attr("stroke-width", 2)
          .attr("d", d => self.line(d.values));

    self.points = self.svg
      .append("g")
      .classed("points", true)
      .attr("transform", `translate(${self.margin.left}, ${self.margin.bottom})`)
      .selectAll(".points")
      .data(self.series)
      .join("g")
        .classed("points", true)
        .attr("id", d => `points_${self.tokenize(d.group)}_${self.uid}`)
        .attr("fill", d => self.color(d[self.accessors.color.key]))
        .attr("stroke", d => self.color(d[self.accessors.color.key]))
        .selectAll(".point")
          .data(d => d.values)
          .join("circle")
            .classed("point", true)
            .attr("id", d => `point_${self.tokenize(d.group)}_${self.uid}}`)
            .attr("cx", d => self.x(d[self.accessors.x.key]))
            .attr("cy", d => self.y(d[self.accessors.y.key]))
            .attr("r", self.pointradius);

    /*
    Annotation
    */

    self.annotation = new Legend({
      uid       : self.uid,
      parent    : self.svg,
      container : self.inner,
      data      : self.series,
      color     : self.color,
      width     : self.legend.width,
      height    : self.legend.height,
      margin    : self.margin,
      padding   : self.padding,
      itemsize  : self.legend.itemsize,
      fontsize  : self.legend.fontsize,
      vposition : self.legend.vposition,
      hposition : self.legend.hposition,
      accessor  : self.accessors.color.key
    });

    return self;

  }

/*
Map Data and Set Value Types
*/

  #mapData (data) {

    let self = this;
    let mapped = [];
    let groups = super.getUniqueKeys(data, self.accessors.color.key);

    data.forEach(row => {
      mapped.push({
        [self.accessors.x.key]      : super.asType(self.accessors.x.type, row[self.accessors.x.key]),
        [self.accessors.y.key]      : super.asType(self.accessors.y.type, row[self.accessors.y.key]),
        [self.accessors.color.key]  : super.asType(self.accessors.color.type, row[self.accessors.color.key])
      });
    });

    let series = groups.map(
      key => ({
        group: key,
        values: mapped.filter(
          d => d[self.accessors.color.key] == key
        ).map(
          d => ({
            [self.accessors.x.key]: d[self.accessors.x.key],
            [self.accessors.y.key]: d[self.accessors.y.key]
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
