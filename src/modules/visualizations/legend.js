/*
Imports
*/

import * as D3 from "d3";

/*
Prototype
*/

// Overview Visualization Entry Point
var Legend = function (config) {
    console.log(config);
    return this.__init__(config);
};


// Overview Visualization Methods
Legend.prototype = {

  __init__ : function (config) {
    var self = this;

    self.uid        = config.uid;
    self.parent     = config.parent;
    self.container  = config.container;
    self.data       = config.data;
    self.color      = config.color;
    self.width      = config.width;
    self.height     = config.height;
    self.itemsize   = config.itemsize;
    self.fontsize   = config.fontsize;
    self.accessor   = config.accessor;
    self.vposition  = config.vposition;
    self.hposition  = config.hposition;
    self.position   = {
      top: 0,
      left: 0,
      bottom: self.container.height - self.height,
      right: self.container.width - self.width,
      center: {
        vertical: (self.container.height - self.height) / 2,
        horizontal: (self.container.height - self.height) / 2
      }
    }

    self.legend = self.parent.append("g")
      .classed("legend", true)
      .attr("id", d => `legend_${self.uid}`)
      .attr("x", self.position[self.hposition])
      .attr("y", self.position[self.vposition])
      .attr("width", self.width)
      .attr("height", self.height);

    self.colors = self.legend.append("g")
      .classed("legend-colors", true)
      .selectAll(".legend-colors")
      .data(self.data)
      .enter()
        .append("rect")
        .classed("legend-color", true)
        .attr("id", d => `legend-color_${self.uid}_${d[self.accessor]}`)
        .attr("x", self.container.width - 100)
        .attr("y", (d, i) => 10 + i * (self.itemsize + 5))
        .attr("width", self.itemsize)
        .attr("height", self.itemsize)
        .style("fill", d => self.color(d[self.accessor]));

    self.labels = self.legend.append("g")
      .classed("legend-labels", true)
      .selectAll(".legend-label")
      .data(self.data)
      .enter()
      .append("text")
        .classed("legend-label", true)
        .attr("id", `legend-label_${self.uid}`)
        .attr("x", self.container.width - 100 + self.itemsize * 1.2)
        .attr("y", (d, i) => 10 + i * (self.itemsize + 5) + (self.itemsize / 2))
        .attr("text-anchor", "right")
        .text(d => d[self.accessor])
        .style("alignment-baseline", "middle");

    return self;
  },

  _rename: function (name) {
    return (typeof(name) === "string") ? name.replace(/\s/g, "-").toLowerCase() : "";
  }

};

/*
Exports
*/

export default Legend;

