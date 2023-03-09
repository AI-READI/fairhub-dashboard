/*
Imports
*/

import * as D3 from "d3";

/*
Data Simulator Prototype
*/

// Data Simulator Entry Point
var DataSimulator = function (config) {
	return this.__init__(config);
};

// Data Simulator Methods
DataSimulator.prototype = {

	__init__ : function (config) {
		var self = this;

		return self;
	}

}

/*
Exports
*/

export default DataSimulator;
