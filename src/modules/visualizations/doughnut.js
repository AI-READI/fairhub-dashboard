/*
Imports
*/

import * as D3 from "d3";

/*
Prototype
*/

// Overview Visualization Entry Point
var Doughnut = function (config) {
    return this.__init__(config);
};

// Overview Visualization Methods
Doughnut.prototype = {

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

    self.data       = { healthy: 12, prediabetic: 1, diabetic: 13}
    self.columns = ['group', 'healthy', 'prediabetic', 'diabetic'];

    self.svg = D3.select(self.id)

    return self;

  },

  update: function () {
    let self = this;

    self.svg = D3.select(self.id);

    self.doughnut = D3.pie().value(function(d) {return d.value; })(D3.entries(self.data));

    self.subgroups = self.columns.slice(1);
    self.groups = D3.map(self.data, function (d) { return (d.group) })

    self.color = D3.scaleOrdinal()
      .domain(self.groups)
      .range(['#e41a1c','#377eb8','#4daf4a'])

    self.svg.append("g")
      .selectAll("g")
      .data(self.doughnut)
      .enter().append("path")
        .attr('d', d3.arc()
         .innerRadius(200)         // This is the size of the donut hole
         .outerRadius(self.inner.width / 2)
        )
        .attr("fill", function (d) { return self.color(d.data.key); })

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

export default Doughnut;
