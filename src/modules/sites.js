/*
Imports
*/

import * as D3 from "d3";

/*
Data Simulator Prototype
*/

// Data Simulator Entry Point
var SitesVisualization = function (config = {}) {
  return this.__init__(config);
};

// Data Simulator Methods
SitesVisualization.prototype = {

  __init__ : function (config) {
    let self = this;
    self.id     = config.id;
    self.width  = config.width;
    self.height = config.height;

    return self;
  }

}

/*
Exports
*/

export default SitesVisualization;
