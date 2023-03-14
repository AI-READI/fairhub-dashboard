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

    self.inner      = {
      height: self.height - self.margin.top - self.margin.bottom,
      width: self.width - self.margin.left - self.margin.right
    }

    self.data       = [
      {group: "meow", small: 12, medium: 1, large: 13},
      {group: "mooo", small: 6, medium: 6, large: 33},
      {group: "woof", small: 11, medium: 28, large: 12},
      {group: "oink", small: 19, medium: 6, large: 1}
    ]
    self.columns = ['group', 'small', 'medium', 'large'];

    self.svg = D3.select(self.id)

    return self;

  },

  update: function () {
    let self = this;

    self.svg = D3.select(self.id);

    self.subgroups = self.columns.slice(1);
    self.groups = D3.map(self.data, function (d) { return (d.group) })

    self.x = D3.scaleBand()
      .domain(self.groups)
      .range([0, self.inner.width])
      .padding([0.2]);

    self.y = D3.scaleLinear()
      .domain([0, 100])
      .range([ self.inner.height, 0 ]);

    self.svg.append("g")
      .attr("transform", `translate(${self.margin.left}, ${self.inner.height + self.margin.top})`)
      .call(D3.axisBottom(self.x).tickSizeOuter(5));

    self.svg.append("g")
      .attr("transform", `translate(${self.margin.left}, ${self.margin.top})`)
      .call(D3.axisLeft(self.y));

    self.color = D3.scaleOrdinal()
      .domain(self.groups)
      .range(['#e41a1c','#377eb8','#4daf4a'])

    self.stacked = D3.stack()
      .keys(self.subgroups)(self.data)

    self.svg.append("g")
      .selectAll("g")
      .data(self.stacked)
      .enter().append("g")
        .attr("fill", function (d) { return self.color(d.key); })
        .selectAll("rect")
        .data(function (d) { return d; })
        .enter().append("rect")
          .attr("transform", `translate(${self.margin.left}, ${self.margin.bottom})`)
          .attr("x", function (d) { return self.x(d.data.group); })
          .attr("y", function (d) { return self.y(d[1]); })
          .attr("height", function (d) { return self.y(d[0]) - self.y(d[1]); })
          .attr("width", self.x.bandwidth());

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
