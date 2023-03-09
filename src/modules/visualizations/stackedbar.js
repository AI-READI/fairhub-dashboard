/*
Imports
*/

import * as d3 from "d3";

/*
Prototype
*/

// Overview Visualization Entry Point
var StackedBar = function (config) {
    return this.__init__(config);
};

// Overview Visualization Methods
StackedBar.prototype = {

  __init__ : function (config) {
    let self = this;

    self.id         = config.id;
    self.width      = config.width;
    self.height     = config.height;

    return self;

  },

  update: function () {
    let self = this;
    console.log("Updated!")
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

export default StackedBar;
