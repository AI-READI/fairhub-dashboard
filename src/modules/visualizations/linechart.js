/*
Imports
*/

import * as D3 from "D3";

/*
Prototype
*/

// Overview Visualization Entry Point
var LineChart = function (config) {
    return this.__init__(config);
};

// Overview Visualization Methods
LineChart.prototype = {

  __init__ : function (config) {
    var self = this;

    self.id         = config.id;
    self.margin     = config.margin;
    self.padding    = config.padding;
    self.width      = config.width;
    self.height     = config.height;
    self.palette    = config.palette;
    self.opacity    = config.opacity;
    self.ncols      = config.ncols;
    self.data       = config.data;

    self.inner      = {
      height: self.height - self.margin.top - self.margin.bottom,
      width: self.width - self.margin.left - self.margin.right
    }

    self.svg = null;
    self.groups = null;
    self.series = null;
    self.color = null;
    self.x = null;
    self.y = null;
    self.xAxis = null;
    self.yAxis = null;
    self.line = null;
    self.series = null;
    self.points = null;
    self.pointradius = 5;

    return self;

  },

  update: function () {
    var self = this;

    /*
    Setup
    */

    self.svg = D3.select(self.id)
      .classed("line-chart", true);

    self.color = D3.scaleOrdinal()
      .domain(self.series)
      .range(self.palette);

    /*
    Generate Axes
    */

    self.x = D3.scaleTime()
      .domain(D3.extent(self.data, function (d) { return d.date; }))
      .range([0, self.inner.width]);

    self.y = D3.scaleLinear()
      .domain([0, D3.max(self.data, function (d) { return +d.value; })])
      .range([self.inner.height, 0]);

    self.xAxis = self.svg.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(${self.margin.left}, ${self.inner.height + self.margin.top})`)
      .call(D3.axisBottom(self.x).tickSizeOuter(5).tickPadding(10))

    self.yAxis = self.svg.append("g")
      .classed("y-axis", true)
      .attr("transform", `translate(${self.margin.left}, ${self.margin.top})`)
      .call(D3.axisLeft(self.y))

    /*
    Generate Data Elements
    */

    self.line = D3.line()
        .x(d => self.x(d.x))
        .y(d => self.y(d.y))

    self.series = self.svg.append("path")
      .data(self.data)
      .join("path")
        .attr("d", self.line)
        .attr("stroke",  d => self.color(d.key))
        .attr("stroke-width", 1.5)
        .attr("fill", d => self.color(d.key))
        .attr("fill-opacity", 0.7);

    self.points = self.svg
      .selectAll("dots")
        .data(self.data)
        .join('g')
          .style("fill", d => self.color(d.key))
      .selectAll("points")
        .data(d => d.values)
        .join("circle")
          .attr("cx", d => x(d.x))
          .attr("cy", d => y(d.y))
          .attr("r", self.pointradius)
          .attr("stroke", "transparent")

    return self;
  },

  debug : function () {
    var self = this;
    console.log(self);
    return self;
  },

  _uid: function () {
    return `O-${Math.random().toString(16).slice(2, 8)}`
  },

  _rename: function (name) {
    return (typeof(name) === "string") ? name.replace(/\s/g, "-").toLowerCase() : "";
  }

};

/*
Exports
*/

export default LineChart;
