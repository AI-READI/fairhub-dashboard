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
    var self = this;

    self.id         = config.id;
    self.margin     = config.margin;
    self.padding    = config.padding;
    self.width      = config.width;
    self.height     = config.height;
    self.palette    = config.palette;
    self.ncols      = config.ncols;

    self.inner      = {
      height: self.height - self.margin.top - self.margin.bottom,
      width: self.width - self.margin.left - self.margin.right,
    }

    self.data       = [
      {group: "healthy", value: 119},
      {group: "prediabetic", value: 60},
      {group: "diabetic", value: 81}
    ]
    self.columns = self.data.map(d => d.group);
    self.radius = (Math.min(self.inner.width, self.inner.height) / 2);
    self.svg = null;
    self.dougnut = null;
    self.color = null;
    self.arc = null;
    self.arcs = null;

    return self;

  },

  update: function () {
    var self = this;

    self.svg = D3.select(self.id)
      .append("g")
      .attr("transform", `translate(${self.inner.width / 2}, ${self.inner.height / 2})`);

    self.doughnut = D3.pie()
      .value(d => d.value)(self.data)
      .map(function (d) { d["label"] = d.data.group; return d;});

    self.color = D3.scaleOrdinal()
      .domain(self.columns)
      .range(self.palette);

    /*
    Generate Data Elements
    */

    self.dataArcs = D3.arc()
      .innerRadius(self.radius * 0.5)
      .outerRadius(self.radius * 0.8);

    self.arcs = self.svg
      .selectAll('.arcs')
        .data(self.doughnut)
        .join("path")
          .attr("d", self.dataArcs)
          .attr('fill', d => self.color(d.label))
          .attr("stroke-width", "2px")
          .attr("opacity", 0.7)

    /*
    Generate Text Labels
    */

    self.labelArcs = D3.arc()
      .innerRadius(self.radius * 0.9)
      .outerRadius(self.radius * 0.9);

    self.labellines = self.svg
      .selectAll('.label-lines')
      .data(self.doughnut)
      .enter()
      .append('polyline')
        .attr("stroke", "black")
        .attr("fill", "none")
        .attr("stroke-width", 1)
        .attr('points', function(d) {
          let x = self.dataArcs.centroid(d), // line insertion in the slice
              y = self.labelArcs.centroid(d), // line break: we use the other arc generator that has been built only for that
              z = self.labelArcs.centroid(d), // Label position = almost the same as posB
              midangle = d.startAngle + (d.endAngle - d.startAngle) / 2; // we need the angle to see if the X position will be at the extreme right or extreme left
              z[0] = self.radius * 0.9 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
          return [x, y, z];
        })

    self.labels = self.svg
      .selectAll('.labels')
      .data(self.doughnut)
      .enter()
      .append('text')
        .text(d => d.label)
        .attr('transform', d => `translate(${self.radius * 0.95 * ((d.startAngle + (d.endAngle - d.startAngle) / 2) < Math.PI ? 1 : -1)}, ${self.labelArcs.centroid(d)[1]})`)
        .attr('font-size', "4rem")
        .style('text-anchor', d => ((d.startAngle + (d.endAngle - d.startAngle) / 2) < Math.PI ? 'start' : 'end'))

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

export default Doughnut;
