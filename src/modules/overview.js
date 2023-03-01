/*
Imports
*/

import * as D3 from "d3";
import DataSimulator from "./data-simulator.js";

/*
Overview Visualization Prototype
*/

// Overview Visualization Entry Point
var OverviewVisualization = function (config = {}) {
  return this.__init__(config);
};

// Overview Visualization Methods
OverviewVisualization.prototype = {

  __init__ : function (config) {
    let self = this;

    self.mode     = config.mode;
    self.name     = config.name;
    self.width    = config.width;
    self.height   = config.height;
    self.simulate = config.simulate;
    return self;

  },

  __data__ : function () {
    let self = this;
      if (self.simulate) {
        self.data = new DataSimulator()[self.name]();
      } else {
        self.data = self.get_data();
      }
    return self;
  },

  simulate_data : function () {

  },

  get_data : function () {

  }

}

export default OverviewVisualization;


// let OverviewVisualization = {
//   name: 'LineChart',
//   props: {
//     data: {
//       required: true,
//       type: Array,
//     },
//     width: {
//       default: 500,
//       type: Number,
//     },
//     height: {
//       default: 270,
//       type: Number,
//     }
//   },
//   data() {
//     return {
//       padding: 60,
//       data: data
//     };
//   },
//   computed: {
//     rangeX() {
//       const width = this.width -this.padding;
//       return [0, width];
//     },
//     rangeY() {
//       const height = this.height - this.padding;
//       return [0, height];
//     },
//     path() {
//       const x = d3.scaleLinear().range(this.rangeX);
//       const y = d3.scaleLinear().range(this.rangeY);
//       d3.axisLeft().scale(x);
//       d3.axisTop().scale(y);
//       x.domain(d3.extent(this.data, (d, i) => i));
//       y.domain([0, d3.max(this.data, d => d)]);
//       return d3.line()
//         .x((d, i) => x(i))
//         .y(d => y(d));
//     },
//     line() {
//       return this.path(this.data);
//     },
//     viewBox() {
//       return `0 0 ${this.width} ${this.height}`;
//     }
//   },
// };
