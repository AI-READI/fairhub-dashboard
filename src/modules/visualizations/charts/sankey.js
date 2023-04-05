/*
Imports
*/

import * as D3 from "d3";
import * as D3Sankey from "d3-sankey";
import Chart from "../chart.js";

/*
Defaults
*/

const _defaults = {
  id: "#overview-sankey",
  width: 1200,
  height: 540,
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
    width: 120,
    padding: 40,
    class: "node",
    alignment: "justify",
    stroke: "transparent"
  },
  link: {
    class: "link"
  }
}

/*
Prototype
*/

// Overview Visualization Entry Point
var Sankey = function (config) {
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
    var self = this;

    self.id           = config.id;
    self.width        = config.width;
    self.height       = config.height;
    self.margin       = config.margin;
    self.palette      = config.palette;
    self.node         = config.node;
    self.link         = config.link;
    self.ncols        = config.ncols;
    self.data         = config.data;

    self.uid          = self._uid();
    self.nodeAlign    = self._node_alignment_map[self.node.alignment];
    self.linkMethod   = D3Sankey.sankeyLinkHorizontal();
    self.inner        = {
      height: self.height - self.margin.top - self.margin.bottom,
      width: self.width - self.margin.left - self.margin.right
    };

    return self.update();

  },

  update: function () {
    var self = this;

    /*
    Graph Setup
    */

    self.svg = D3.select(self.id)
      .classed("sankey-chart", true);

    self.color = D3.scaleOrdinal(self.palette);

    self.graph = D3Sankey.sankey(self.data)
      .nodeId(d => d.name)
      .nodeAlign(self.nodeAlign)
      .nodeWidth(self.node.width)
      .nodePadding(self.node.padding)
      .size([self.width, self.height])
      .extent([[self.margin.left, self.margin.top], [self.width - self.margin.right, self.height - self.margin.bottom]])
      .nodes(self.data.nodes)
      .links(self.data.links)
      .nodeSort(null)(self.data);

    // self.graph = self.graph(self.data);

    // Layout sorting
    self.nodeSort = self.node.sort !== null ? self.graph.nodes.sort((a, b) => D3[self.node.sort](a.value, b.value)) : null;
    self.linkSort = self.link.sort !== null ? self.graph.links.sort((a, b) => D3[self.link.sort](a.value, b.value)) : null;

    /*
    Define Gradients
    */

    self.gradients = self.svg
      .append("defs")
        .style("mix-blend-mode", "multiply")
        .selectAll("linearGradient")
        .data(self.graph.links)
        .enter()
          .append("linearGradient")
            .attr("id", d => `${self.uid}_gradient_${self._rename(d.source.name)}_${self._rename(d.target.name)}`)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", d => d.source.x1)
            .attr("y1", d => Math.max(d.source.y0, d.target.y0, d.source.y1, d.target.y1))
            .attr("x2", d => d.target.x0)
            .attr("y2", d => Math.max(d.source.y0, d.target.y0, d.source.y1, d.target.y1));

    self.gradientsource = self.gradients
      .append("stop")
        .attr("offset", "5%")
        .attr("stop-color", d => d.color = self.color(self._rename(d.source.name)))
        .attr("stop-opacity", self.link.opacity);

    self.gradienttarget = self.gradients
      .append("stop")
        .attr("offset", "95%")
        .attr("stop-color", d => d.color = self.color(self._rename(d.target.name)))
        .attr("stop-opacity", self.link.opacity);

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
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => self.color(self._rename(d.name)))
            .attr("opacity", self.node.opacity)
            .style("shape-rendering", "crispEdges");

    self.links = self.svg
      .append("g")
        .classed(`${self.link.class}s`, true)
        .selectAll("path")
        .data(self.graph.links)
        .enter("path")
          .append("path")
            .classed(self.link.class, true)
            .attr("d", d => d.path = self.linkMethod(d))
            .attr("fill", "none")
            .attr("stroke", d => `url(#${self.uid}_gradient_${self._rename(d.source.name)}_${self._rename(d.target.name)})`)
            .attr("stroke-width", d => d.width)
            .attr("stroke-linecap", "square")
            .attr("opacity", self.link.opacity)
            .attr("vector-effect", "none")
            .style("shape-rendering", "geometricPrecision");

    /*
    Generate Labels
    */

    self.nodelabels = self.svg
      .append("g")
        .classed(`${self.node.class}-labels`, true)
        .selectAll("text")
        .data(self.graph.nodes)
        .join("text")
          .text(d => `${d.name} (${d.value})`)
            .classed(`${self.node.class}-label`, true)
            .attr("id", d =>  `${self.uid}_node-label_${self._rename(d.name)}`)
            .attr("font-size", self.node.fontsize)
            .attr("x", d => d.x0)
            .attr("y", d => d.y0 - (self.node.fontsize / 2));

    return self;

  },

  debug: function () {
    let self = this;
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

export default Sankey;
