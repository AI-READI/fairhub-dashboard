/*
Imports
*/

import * as D3 from "d3";

/*
Prototype
*/

// Overview Visualization Entry Point
var StackedBar = function (config) {
    return this.__init__(config);
};

// Overview Visualization Methods
StackedBar.prototype = {

  __init__ : function (config) {
    let self = this;

    self.id         = config.id;
    self.margin     = config.margin;
    self.padding    = config.padding;
    self.width      = config.width;
    self.height     = config.height;
    self.palette    = config.palette;

    self.barClass   = "bar";

    self.inner      = {
      height: self.height - self.margin.top - self.margin.bottom,
      width: self.width - self.margin.left - self.margin.right
    }

    // Simulated data, will come from an API request
    self.data       = [
      {group: "Screened In", healthy: 119, prediabetic: 30, diabetic: 81},
      {group: "Did Consent", healthy: 72, prediabetic: 21, diabetic: 69},
      {group: "Are Active", healthy: 31, prediabetic: 4, diabetic: 37},
      {group: "Have Completed", healthy: 18, prediabetic: 12, diabetic: 19},
    ]

    // Need to compute this dynamically once data schema is specified
    self.columns = ['group', 'healthy', 'prediabetic', 'diabetic'];

    self.svg = null;
    self.groups = null;
    self.subgroups = null;
    self.x = null;
    self.y = null;
    self.stacked = null;
    return self;

  },

  update: function () {
    let self = this;

    self.svg = D3.select(self.id);

    self.groups = D3.map(self.data, function (d) { return (d.group) })
    self.subgroups = self.columns.slice(1);

    self.stacked = D3.stack()
      .keys(self.subgroups)(self.data);

    self.x = D3.scaleBand()
      .domain(self.groups)
      .range([0, self.inner.width])
      .paddingInner(0.05)
      .paddingOuter(0)
      .align(0);

    self.y = D3.scaleLinear()
      .domain([0, 260])
      .range([self.inner.height, 0]);

    self.xAxis = self.svg.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(${self.margin.left}, ${self.inner.height + self.margin.top})`)
      .call(D3.axisBottom(self.x).tickSizeOuter(5).tickPadding(10))
      .selectAll(".tick")
      .data(self.data)
        .attr("transform", function (d) { return `translate(${self.x(d.group)}, 0)`})
        .selectAll("text")
        .classed("label", true)
        .style("text-anchor", "start");

    self.yAxis = self.svg.append("g")
      .classed("y-axis", true)
      .attr("transform", `translate(${self.margin.left}, ${self.margin.top})`)
      .call(D3.axisLeft(self.y))
      .selectAll("text")
      .classed("label", true)
      .style("text-anchor", "end");

    self.color = D3.scaleOrdinal()
      .domain(self.groups)
      .range(self.palette);

    self.bars = self.svg.append("g")
      .classed(`${self.barClass}s`, true)
      .selectAll("g")
      .data(self.stacked)
      .enter()
        .append("g")
        .classed(`bar-group`, true)
        .attr("fill", function (d) { return self.color(d.key); })
        .selectAll("rect")
        .data(function (d) { return d; })
        .enter()
          .append("rect")
          .classed(`${self.barClass}`, true)
          .attr("transform", `translate(${self.margin.left}, ${self.margin.bottom})`)
          .attr("x", function (d) { console.log(d); return self.x(d.data.group); })
          .attr("y", function (d) { return self.y(d[1]); })
          .attr("height", function (d) { return self.y(d[0]) - self.y(d[1]); })
          .attr("width", self.x.bandwidth())
          .attr("opacity", 0.7)
          .text(function (d) { return d.data.group; });

    return self;
  },

  debug : function () {
    let self = this;
    console.log(self);
    return self;
  }

};

/*
Exports
*/

export default StackedBar;
