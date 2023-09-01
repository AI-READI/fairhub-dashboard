/*
Imports
*/

import * as D3 from "d3";
import Interface from "../interface.js";

/*
Chart Filters Class
*/

class Filters extends Interface {

    constructor (config) {

      // Configure Parent
      super(config);

      let self = this;

      // Configure Chart Filters
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
      self.id = `${self.id}_filters`;

      return self.update();

    }

    update () {

      let self = this;

      /*
      Generate Filters
      */

      self.filters = self.parent.append("div")
        .classed("filters", true)
        .attr("width", self.width)
        .attr("height", self.height)
          .append("select")
          .classed("filters-items", true);

      self.options = self.filters
        .selectAll(".filter-item")
        .data(self.data)
        .enter()
          .append("option")
          .classed("filter-item", true)
          .attr("id", d => `filter-item_${self.uid}_${d[self.accessor]}`)
          .style("cursor", "pointer");

      // Filters Events
      self.options.on("mouseup", (e, d) => self.#mouseUpOptions(e, d));
      self.filters.on("mouseup", (e, d) => self.#mouseUpFilters(e, d));

      return self;

    }

    #mouseUpFilters (e, d) {
      let self = this;
      console.log(e);
      D3.select(`#${self.prefix}_${self.tokenize(d.key)}_${self.uid}`)
        .transition()
        .duration(self.transitionduration)
        .attr("opacity", 1.0);
      return self;
    }

    #mouseUpOptions (e, d) {
      let self = this;
      console.log(e);
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

export default Filters;

