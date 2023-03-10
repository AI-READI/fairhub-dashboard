/*
Imports
*/

import * as d3 from "d3";
import * as d3_sankey from "d3-sankey";

/*
Prototype
*/

// Overview Visualization Entry Point
var Sankey = function (config) {
    return this.__init__(config);
};

// Overview Visualization Methods
Sankey.prototype = {

  __init__ : function (config) {
    let self = this;

    self.id         = config.id;
    self.width      = config.width;
    self.height     = config.height;

    // Generate sankey – sample data
    self.data = {
      nodes: [
        { id: "A1" },
        { id: "A2" },
        { id: "A3" },
        { id: "A4" },
        { id: "B1" },
        { id: "B2" },
        { id: "B3" },
        { id: "C1" },
        { id: "C2" }
      ],
      links: [
        { source: "A1", target: "B1", value: 27 },
        { source: "A2", target: "B1", value: 19 },
        { source: "A3", target: "B2", value: 18 },
        { source: "A4", target: "C2", value: 3 },
        { source: "B1", target: "C1", value: 46 },
        { source: "B2", target: "C1", value: 17 },
        { source: "B2", target: "C2", value: 1 }
      ]
    };

    self.graph = d3_sankey.sankey(self.data)
      .size([self.width, self.height])
      .nodeId(d => d.id)
      .nodeAlign(d3_sankey.sankeyCenter)
      .nodeSort(null)
      .nodeWidth(20)
      .nodePadding(10)
      // .extent([[0, 5], [self.width, self.height - 5]])

    return self;

  },

  update: function () {
    let self = this;


    self.graph = d3_sankey.sankey(self.data)
      .size([self.width, self.height])
      .nodeId(d => d.id)
      .nodeAlign(d3_sankey.sankeyCenter)
      .nodeSort(null)
      .nodeWidth(20)
      .nodePadding(10)
      .nodes(self.data.nodes)
      .links(self.data.links)\
      .computeNodeLinks();

    console.log(self.graph)

    self.svg = d3.select(self.id);

    self.links = self.svg.append("g")
      .selectAll(".link")
      .data(self.data.links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", self.graph.links() )
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) { return b.dy - a.dy; });

    self.svg.append("g")
      .selectAll(".node")
      .data(self.data.nodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })

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
