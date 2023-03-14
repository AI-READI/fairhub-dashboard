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
    self.nodeClass  = "node"
    self.linkClass  = "link"
    self.inner      = {
      height: self.height - self.margin.top - self.margin.bottom,
      width: self.width - self.margin.left - self.margin.right
    };

    // Generate sankey – sample data
    self.data = {
      nodes: [
        { name: "A1" }, // value: 27
        { name: "A2" }, // value: 19
        { name: "A3" }, // value: 18
        { name: "A4" }, // value: 3
        { name: "B1" }, // value: 46
        { name: "B2" }, // value: 14
        { name: "B3" }, // value: 4
        { name: "C1" }, // value: 63
        { name: "C2" }  // value: 8
      ],
      links: [
        { source: "A1", target: "B1", value: 27 },
        { source: "A2", target: "B1", value: 19 },
        { source: "A3", target: "B2", value: 18 },
        { source: "A3", target: "B3", value: 4  },
        { source: "A4", target: "C2", value: 3 },
        { source: "B1", target: "C1", value: 46 },
        { source: "B2", target: "C1", value: 17 },
        { source: "B2", target: "C2", value: 1 },
        { source: "B3", target: "C2", value: 4 }
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
      .nodeAlign(D3Sankey.sankeyCenter)
      .nodeWidth(self.node.width)
      .nodePadding(self.node.padding)
      .size([self.width, self.height])
      .extent([[self.margin.left, self.margin.top], [self.width - self.margin.right, self.height - self.margin.bottom]])
      .nodes(self.data.nodes)
      .links(self.data.links);

    self.graph = self.graph(self.data);

    self.links = self.svg
      .append("g")
      .classed("links", true)
      .selectAll("path")
      .data(self.graph.links)
      .enter()
        .append("path")
        .classed(self.linkClass, true)
        .attr("d", function (d) { console.log(d); return D3Sankey.sankeyLinkHorizontal(d);})
        .attr("stroke-opacity", 0.2)
        .attr("fill", "none")
        .attr("stroke-width", function (d) { return Math.max(1, d.width);})
        .sort(function(a, b) { return b.dy - a.dy;});

    self.links.append("title")
      .text(function(d) { return `${d.source.name} → ${d.target.name}\n${d.value}`;});

    self.nodes = self.svg
      .append("g")
      .classed("nodes", true)
      .selectAll("rect")
      .data(self.graph.nodes)
      .enter()
        .append("rect")
        .classed(self.nodeClass, true)
        .attr("x", function (d) {return d.x0;})
        .attr("y", function (d) {return d.y0;})
        .attr("width", function (d) {return d.x1 - d.x0;})
        .attr("height", function (d) {return d.y1 - d.y0;})
        .attr("fill", function(d) {return d.color = self.color(d.name.replace(/ .*/, ""));})
        .attr("stroke", function(d) {return D3.rgb(d.color).darker(2);})
        .append("title")
          .text(function(d) {console.log(`${d.name}\n${D3.format(",.0f")(d.value)} Participants`); return `${d.name}\n${D3.format(",.0f")(d.value)} Widgets`;});

    self.nodes.append("title")
      .text(function (d) { return `${d.id}\n${d.value}` });

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
