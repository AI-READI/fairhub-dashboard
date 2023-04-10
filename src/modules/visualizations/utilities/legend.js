/*
Imports
*/

import * as D3 from "d3";

/*
Chart Legend Class
*/

class Legend {

    constructor (config) {

      // Configure Chart Legend
      this.uid        = config.uid;
      this.parent     = config.parent;
      this.container  = config.container;
      this.data       = config.data;
      this.color      = config.color;
      this.width      = config.width;
      this.height     = config.height;
      this.margin     = config.margin;
      this.padding    = config.padding;
      this.itemsize   = config.itemsize;
      this.fontsize   = config.fontsize;
      this.accessor   = config.accessor;
      this.vposition  = config.vposition;
      this.hposition  = config.hposition;

      // Computed Refs
      this.position   = {
        top     : this.margin.top + this.padding.top,
        left    : this.margin.left + this.padding.left,
        bottom  : this.container.height - this.height - this.padding.bottom,
        right   : this.container.width - this.width - this.padding.right,
        center  : {
          vertical    : (this.container.height - this.height) / 2,
          horizontal  : (this.container.height - this.height) / 2
        }
      };

      return this.update();

    }

    update () {

      /*
      Generate Legend
      */

      this.legend = this.parent.append("g")
        .classed("legend", true)
        .attr("id", d => `legend_${this.uid}`)
        .attr("x", this.position[this.hposition])
        .attr("y", this.position[this.vposition])
        .attr("width", this.width)
        .attr("height", this.height);

      this.colors = this.legend.append("g")
        .classed("legend-colors", true)
        .selectAll(".legend-colors")
        .data(this.data)
        .enter()
          .append("rect")
          .classed("legend-color", true)
          .attr("id", d => `legend-color_${this.uid}_${d[this.accessor]}`)
          .attr("x", this.position[this.hposition])
          .attr("y", (d, i) => this.position[this.vposition] + 10 + i * (this.itemsize + 5))
          .attr("width", this.itemsize)
          .attr("height", this.itemsize)
          .style("fill", d => this.color(d[this.accessor]));

      this.labels = this.legend.append("g")
        .classed("legend-labels", true)
        .selectAll(".legend-label")
        .data(this.data)
        .enter()
        .append("text")
          .classed("legend-label", true)
          .attr("id", `legend-label_${this.uid}`)
          .attr("x", this.position[this.hposition] + this.itemsize * 1.2)
          .attr("y", (d, i) => this.position[this.vposition] + 10 + i * (this.itemsize + 5) + (this.itemsize / 2))
          .attr("text-anchor", "right")
          .text(d => d[this.accessor])
          .style("alignment-baseline", "middle");

      return this;

    }

}

/*
Exports
*/

export default Legend;

