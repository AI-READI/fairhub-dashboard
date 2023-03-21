/*
Imports
*/

import * as D3 from "d3";
import * as D3Sankey from "d3-sankey";

/*
Defaults
*/

const _defaults = {
  id: "#overview-sankey",
  width: 996,
  height: 560,
  margin: {
    top: 40,
    left: 40,
    right: 40,
    bottom: 40
  },
  palette: [
    "#540d6e",
    "#ee4266",
    "#ffd23f",
    "#3bceac",
    "#0ead69"
  ],
  node: {
    width: 40,
    padding: 20,
    class: "node",
    alignment: "justify",
    stroke: "transparent"
  },
    edge: {
    class: "edge"
  }
}

/*
Prototype
*/

// Overview Visualization Entry Point
var Sankey = function (config = _defaults) {
    return this.__init__(config);
};

// Overview Visualization Methods
Sankey.prototype = {

  _node_alignment_map : {
    "left": D3Sankey.sankeyLeft,
    "right": D3Sankey.sankeyRight,
    "center": D3Sankey.sankeyCenter,
    "justify": D3Sankey.sankeyJustify
  },

  // Default config

  __init__ : function (config) {
    let self = this;

    self.id           = config.id;
    self.width        = config.width;
    self.height       = config.height;
    self.margin       = config.margin;
    self.palette      = config.palette;
    self.node         = config.node;
    self.link         = config.link;

    self.nodeAlign    = self._node_alignment_map[self.node.alignment];
    self.linkMethod   = D3Sankey.sankeyLinkHorizontal();
    self.strokeWidth  = 2;
    self.inner        = {
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

    /*
    Graph Setup
    */

    self.svg = D3.select(self.id);
    self.color = D3.scaleOrdinal(self.palette);
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

    /*
    Generate Data Elements
    */

    self.nodes = self.svg
      .append("g")
      .classed(`${self.node.class}s`, true)
      .selectAll("rect")
      .data(self.graph.nodes)
      .enter()
        .append("rect")
        .classed(self.node.class, true)
        .attr("x", function (d) {return d.x0 + self.strokeWidth;})
        .attr("y", function (d) {return d.y0 + self.strokeWidth;})
        .attr("width", function (d) {return d.x1 - d.x0 - (2 * self.strokeWidth);})
        .attr("height", function (d) {return d.y1 - d.y0  - (2 * self.strokeWidth);})
        .attr("fill", function(d) {return d.color = self.color(d.name.replace(/ .*/, ""));})
        .attr("stroke", function(d) {return self.node.stroke})
        .attr("stroke-width", self.strokeWidth)

    self.links = self.svg
      .append("g")
      .classed(`${self.link.class}s`, true)
      .selectAll("path")
      .data(self.graph.links)
      .enter()
        .append("path")
        .classed(self.link.class, true)
        .attr("d", function (d) { console.log(self.linkMethod(d)); return self.linkMethod(d);})
        .attr("fill", function(d) {return d.color = self.color(d.source.name.replace(/ .*/, ""));})
        .attr("stroke", function(d) {return d.color; })
        .attr("stroke-width", function (d) { return Math.max(1, d.width - (2 * self.strokeWidth));})
        .attr("opacity", 0.7)
        .sort(function(a, b) { return b.dy - a.dy;})


    /*
    Generate Labels
    */

    self.nodelabels = self.svg
      .append("g")
      .classed(`${self.node.class}-labels`, true)
      .selectAll("text")
      .data(self.graph.nodes)
      .join("text")
        .classed(`${self.node.class}-label`, true)
        .attr("x", function (d) {return d.x0 < self.inner.width / 2 ? d.x1 + 6 : d.x0 - 6;})
        .attr("y", function (d) {return (d.y1 + d.y0) / 2;})
        // .style("transform", "rotate(90deg)")
        .attr("dy", "0.35em")
        .attr("text-anchor", function (d) { return d.x0 < self.inner.width / 2 ? "start" : "end"})
        .text(function(d) {return `${d.value.toLocaleString()} ${d.name} `;})

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
