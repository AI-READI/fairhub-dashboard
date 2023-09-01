/*
Imports
*/

import * as D3 from "d3";
import Interface from "../interface.js";

/*
Chart Legend Class
*/

class Legend extends Interface {

    constructor (config) {

      // Configure Parent
      super(config);

      let self = this;

      // Configure Chart Legend
      self.uid        = config.uid;
      self.parent     = config.parent;
      self.container  = config.container;
      self.data       = config.data;
      self.color      = config.color;
      self.opacity    = config.opacity;
      self.width      = config.width;
      self.height     = config.height;
      self.margin     = config.margin;
      self.padding    = config.padding;
      self.itemsize   = config.itemsize;
      self.fontsize   = config.fontsize;
      self.accessor   = config.accessor;
      self.vposition  = config.vposition;
      self.hposition  = config.hposition;
      self.prefix     = config.prefix;

      // Computed Refs
      self.position   = {
        top     : self.container.top + self.margin.top + self.padding.top,
        left    : self.container.left + self.margin.left + self.padding.left,
        bottom  : self.container.height - self.margin.bottom - self.padding.bottom - self.height,
        right   : self.container.width - self.margin.right - self.padding.right - self.width,
        center  : {
          vertical    : (self.container.height - self.height) / 2,
          horizontal  : (self.container.height - self.width) / 2
        }
      };
      self.id = `${self.id}_legend`;

      return self.update();

    }

    update () {

      let self = this;

      /*
      Generate Legend
      */

      self.legend = D3.select(`${self.id}`)
        .classed("interface-element legend", true)
        .attr("top", self.position[self.hposition])
        .attr("left", self.position[self.vposition])
        .attr("width", self.width)
        .attr("height", self.height)
        .append("div")
          .classed("legend-items", true);

      self.items = self.legend
        .selectAll(".legend-item")
          .data(self.data)
          .enter()
            .append("div")
            .classed("legend-item", true);

      self.colors = self.items
          .append("div")
            .classed("legend-color", true)
            .attr("id", d => `legend-color_${self.uid}_${d[self.accessor]}`)
            .attr("top", self.position[self.hposition])
            .attr("left", (d, i) => self.position[self.vposition] + (i * (self.itemsize + 7)) - 5)
            .style("width", `${self.itemsize}px`)
            .style("height", `${self.itemsize}px`)
            .style("margin-right", "8px")
            .style("background-color", d => self.color(d[self.accessor]))
            .style("cursor", "pointer");

      self.labels = self.items
        .append("div")
            .classed("legend-label", true)
            .attr("id", d => `legend-label_${self.uid}_${d[self.accessor]}`)
            .style("text-transform", "capitalize")
            .style("cursor", "pointer")
            .text(d => d[self.accessor]);

      // Legend Events
      self.items.on("mouseover", (e, d) => self.#mouseOverLegend(e, d));
      self.items.on("mouseout", (e, d) => self.#mouseOutLegend(e, d));

      return self;

    }

    #mouseOverLegend (e, d) {
      let self = this;
      D3.select(`#${self.prefix}_${self.tokenize(d.key)}_${self.uid}`)
        .transition()
        .duration(self.transitionduration)
        .attr("opacity", 1.0);
      return self;
    }

    #mouseOutLegend (e, d) {
      let self = this;
      D3.select(`#${self.prefix}_${self.tokenize(d.key)}_${self.uid}`)
        .transition()
        .duration(self.transitionduration)
        .attr("opacity", self.opacity);
      return self;
    }

}

/*
Exports
*/

export default Legend;

