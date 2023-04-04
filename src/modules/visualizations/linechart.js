/*
Imports
*/

import * as D3 from "D3";
import Legend from "./legend.js";

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

    self.id           = config.id;
    self.margin       = config.margin;
    self.width        = config.width;
    self.height       = config.height;
    self.palette      = config.palette;
    self.opacity      = config.opacity;
    self.ncols        = config.ncols;
    self.data         = config.data;
    self.legend       = config.legend;
    self.pointradius  = config.pointradius;

    // Ref Declarations
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

    // Computed Refs
    self.uid          = self._uid();
    self.inner        = {
      height: self.height - self.margin.top - self.margin.bottom,
      width: self.width - self.margin.left - self.margin.right,
    };
    self.padding      = {
      top: 0,
      left: 20,
      bottom: 0,
      right: 20
    };


    return self.update();

  },

  update: function () {
    var self = this;

    /*
    Setup
    */

    self.svg = D3.select(self.id)
      .classed("line-chart", true);

    // We need to compute these
    self.groups = ['normal', 'prediabetic', 'diabetic'];

    self.series = self.groups.map(
      key => ({
        group: key,
        values: self.data.filter(
          d => d.group == key
        ).map(
          d => ({
            date: new Date(d.date),
            value: d.value
          })
        )
      })
    );

    // console.log(self.groups);

    self.color = D3.scaleOrdinal()
      .domain(self.groups)
      .range(self.palette);

    /*
    Generate Axes
    */

    self.x = D3.scaleTime()
      .domain(D3.extent(self.data, d => new Date(d.date)))
      .range([0, self.inner.width]);

    self.y = D3.scaleLinear()
      .domain([0, D3.max(self.data, d => d.value)])
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

    /*
    Generate Data Elements
    */

    self.line = D3.line()
        .x(d => self.x(d.date))
        .y(d => self.y(d.value));

    self.lines = self.svg
      .append("g")
      .classed("series", true)
      .attr("transform", `translate(${self.margin.left}, ${self.margin.top})`)
      .selectAll(".line")
      .data(self.series)
      .join("path")
        .classed("line", true)
        .attr("fill", "none")
        .attr("stroke", d => self.color(d.group))
        .attr("stroke-width", 2)
        .attr("d", d => self.line(d.values));

    self.points = self.svg
      .selectAll(".points")
      .data(self.series)
      .join("g")
        .classed("points", true)
        .attr("id", d => `points_${self.uid}_${self._rename(d.group)}`)
        .attr("fill", d => self.color(d.group))
        .attr("stroke", d => self.color(d.group))
        .attr("transform", `translate(${self.margin.left}, ${self.margin.top})`)
        .selectAll(".point")
          .data(d => d.values)
          .join("circle")
            .classed("point", true)
            .attr("cx", d => self.x(d.date))
            .attr("cy", d => self.y(d.value))
            .attr("r", self.pointradius)
            .attr("id", d => `point_${self.uid}_${self._rename(d.group)}}`);

    /*
    Annotation
    */

    self.annotation = new Legend({
      uid: self.uid,
      parent: self.svg,
      container: self.inner,
      data: self.series,
      color: self.color,
      width: self.legend.width,
      height: self.legend.height,
      margin: self.margin,
      padding: self.padding,
      itemsize: self.legend.itemsize,
      fontsize: self.legend.fontsize,
      vposition: self.legend.vposition,
      hposition: self.legend.hposition,
      accessor: "group"
    });

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
