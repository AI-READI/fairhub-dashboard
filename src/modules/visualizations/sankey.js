/*
Imports
*/

import * as D3 from "d3";
import * as D3Sankey from "d3-sankey";

/*
Prototype
*/

// Overview Visualization Entry Point
var Sankey = function (
  config = {
    id: "sankey",
    width: 1280,
    height: 720,
    margin: {
      top: 20,
      left: 20,
      right: 20,
      bottom: 20
    }
  }) {
    return this.__init__(config);
};

// Overview Visualization Methods
Sankey.prototype = {

  __init__ : function (config) {
    let self = this;

    self.id         = config.id;
    self.width      = config.width;
    self.height     = config.height;
    self.margin     = config.margin;
    self.node       = config.node;
    self.nodeClass  = "node";
    self.nodeAlign  = D3Sankey.sankeyJustify;
    self.linkClass  = "link";
    self.linkMethod = D3Sankey.sankeyLinkHorizontal();
    self.strokeWidth= 2;
    self.inner      = {
      height: self.height - self.margin.top - self.margin.bottom,
      width: self.width - self.margin.left - self.margin.right
    };

    // Generate sankey – sample data
    self.data = {
      nodes: [
        { name: "Screened In" }, // value: 27
        { name: "Screened Out" }, // value: 19
        { name: "did Consent" }, // value: 18
        { name: "did not Consent" }, // value: 3
        { name: "are Active" }, // value: 46
        { name: "are Inactive" }, // value: 14
        { name: "have Completed" }, // value: 4
        { name: "have Exited" }  // value: 8
      ],
      links: [
        { source: "Screened In", target: "did Consent", value: 128 },
        { source: "Screened In", target: "did not Consent", value: 13 },
        { source: "Screened Out", target: "have Exited", value: 221 },
        { source: "did Consent", target: "are Active", value: 19 },
        { source: "did Consent", target: "are Inactive", value: 5 },
        { source: "did Consent", target: "have Completed", value: 98 },
        { source: "did Consent", target: "have Exited", value: 6 },
        { source: "did not Consent", target: "are Inactive", value: 4 },
        { source: "did not Consent", target: "have Exited", value: 7 }
      ]
    };

    return self.update();

  },

  update: function () {
    let self = this;

    self.svg = D3.select(self.id);

    self.color = D3.scaleOrdinal(D3.schemeSet2);

    self.graph = D3Sankey.sankey(self.data)
      .nodeId(function (d) { return d.name })
      .nodeAlign(self.nodeAlign)
      .nodeWidth(self.node.width)
      .nodePadding(self.node.padding)
      .size([self.width, self.height])
      .extent([[self.margin.left, self.margin.top], [self.width - self.margin.right, self.height - self.margin.bottom]])
      .nodes(self.data.nodes)
      .links(self.data.links);

    self.graph = self.graph(self.data);

    self.nodes = self.svg
      .append("g")
      .classed("nodes", true)
      .selectAll("rect")
      .data(self.graph.nodes)
      .enter()
        .append("rect")
        .classed(self.nodeClass, true)
        .attr("x", function (d) {return d.x0 + self.strokeWidth;})
        .attr("y", function (d) {return d.y0 + self.strokeWidth;})
        .attr("width", function (d) {return d.x1 - d.x0 - (2 * self.strokeWidth);})
        .attr("height", function (d) {return d.y1 - d.y0  - (2 * self.strokeWidth);})
        .attr("fill", function(d) {return d.color = self.color(d.name.replace(/ .*/, ""));})
        .attr("stroke", function(d) {return "transparent"})
        .attr("stroke-width", self.strokeWidth)
        .append("text")
          .text(function(d) {return `${d.name}\n${d.value} Participants`;});

    self.links = self.svg
      .append("g")
      .classed("links", true)
      .selectAll("path")
      .data(self.graph.links)
      .enter()
        .append("path")
        .classed(self.linkClass, true)
        .attr("d", function (d) { return self.linkMethod(d);})
        .attr("fill", function(d) {return d.color = self.color(d.source.name.replace(/ .*/, ""));})
        .attr("stroke", function(d) {return d.color; })
        .attr("stroke-width", function (d) { console.log(d); return Math.max(1, d.width - (2 * self.strokeWidth));})
        .sort(function(a, b) { return b.dy - a.dy;})
        .append("text")
          .text(function(d) { return `From ${d.source.name}, ${d.value} ${d.target.name}`;})
          .attr("font-size", "24px");
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

export default Sankey;
