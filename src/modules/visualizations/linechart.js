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

    self.barClass   = "bar";

    self.inner      = {
      height: self.height - self.margin.top - self.margin.bottom,
      width: self.width - self.margin.left - self.margin.right
    }

    // Simulated data, will come from an API request
    self.data       = [
      {group: "Screened In", healthy: 119, prediabetic: 30, diabetic: 81},
      {group: "Screened Out", healthy: 381, prediabetic: 144, diabetic: 201},
      {group: "Did Consent", healthy: 72, prediabetic: 21, diabetic: 69},
      {group: "Did Not Consent", healthy: 13, prediabetic: 8, diabetic: 10},
      {group: "Active", healthy: 31, prediabetic: 4, diabetic: 37},
      {group: "Inctive", healthy: 3, prediabetic: 2, diabetic: 7},
      {group: "Completed", healthy: 91, prediabetic: 53, diabetic: 71},
      {group: "Exited", healthy: 18, prediabetic: 12, diabetic: 19}
    ];

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
    var self = this;

    /*
    Setup
    */

    self.svg = D3.select(self.id)
      .classed("line-chart", true);

    self.color = D3.scaleOrdinal()
      .domain(self.groups)
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

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", D3.line()
        .x(function(d) { return x(d.date) })
        .y(function(d) { return y(d.value) })
        )

    return self;
  },

  debug : function () {
    var self = this;
    console.log(self);
    return self;
  }

};

/*
Exports
*/

export default LineChart;
