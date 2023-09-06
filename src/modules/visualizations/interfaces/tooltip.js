/*
Imports
*/

import * as D3 from "d3";
import Interface from "../interface.js";

/*
Chart Tooltip Class
*/

class Tooltip extends Interface {

    constructor (config) {

      // Configure Parent
      super(config);

      let self = this;

      // Configure Chart Tooltip
      self.container  = config.container;
      self.data       = config.data;
      self.color      = config.color;
      self.itemsize   = config.itemsize;
      self.fontsize   = config.fontsize;
      self.vposition  = config.vposition;
      self.hposition  = config.hposition;
      self.accessors  = config.accessors;

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

      self.defaultdata = [
          {label: self.accessors.group.name, value: "-"},
          {label: self.accessors.color.name, value: "-"},
          {label: self.accessors.value.name, value: "-"}
      ];

      self.tooltip = D3.select(`${self.getID}_tooltip`)
        .classed("interface-element tooltip", true)
        .attr("id", `${self.setID}_tooltip`)
        .append("div")
          .classed("tooltip-items", true);

      self.items = self.tooltip
        .selectAll(".tooltip-item")
          .data(self.defaultdata)
          .enter()
          .append("div")
            .classed("tooltip-item", true)
            .attr("id", d => `${self.setID}_tooltip-item_${d[self.accessor]}`);

      self.labels = self.items
        .append("span")
          .classed("tooltip-label", true)
          .text(d => `${d.label}: `);

      self.values = self.items
        .append("span")
          .classed("tooltip-value", true)
          .text(d => d.value);

      return self;

    }

    /*
    Generate Tooltip
    */

    update (event, data) {

      let self = this;

      self.clear();

      self.data = [
        {label: self.accessors.group.name, value: data.data[self.accessors.group.key]},
        {label: self.accessors.color.name, value: data[self.accessors.color.key]},
        {label: self.accessors.value.name, value: data[self.accessors.value.key]}
      ];

      self.tooltip = D3.select(`${self.getID}_tooltip`)
        .classed("interface-element tooltip", true)
        .attr("id", `${self.setID}_tooltip`)
        .append("div")
          .classed("tooltip-items", true);

      self.items = self.tooltip
        .selectAll(".tooltip-item")
          .data(self.data)
          .enter()
          .append("div")
            .classed("tooltip-item", true)
            .attr("id", d => `${self.setID}_tooltip-item_${d[self.accessor]}`);

      self.labels = self.items
        .append("span")
          .classed("tooltip-label", true)
          .text(d => `${d.label}: `);

      self.values = self.items
        .append("span")
          .classed("tooltip-value", true)
          .text(d => d.value);

      return self;

    }

    clean () {

      let self = this;

      self.clear();

      self.tooltip = D3.select(`${self.getID}_tooltip`)
        .classed("interface-element tooltip", true)
        .attr("id", `${self.setID}_tooltip`)
        .append("div")
          .classed("tooltip-items", true);

      self.items = self.tooltip
        .selectAll(".tooltip-item")
          .data(self.defaultdata)
          .enter()
          .append("div")
            .classed("tooltip-item", true)
            .attr("id", d => `${self.setID}_tooltip-item_${d[self.accessor]}`);

      self.labels = self.items
        .append("span")
          .classed("tooltip-label", true)
          .text(d => `${d.label}: `);

      self.values = self.items
        .append("span")
          .classed("tooltip-value", true)
          .text(d => d.value);

      return self;

    }

    clear (event, data) {

      let self = this;

      self.values.remove();
      self.labels.remove();
      self.items.remove();
      self.tooltip.remove();

      return self;

    }

}

/*
Exports
*/

export default Tooltip;

