/*
Imports
*/

import * as D3 from "d3";

/*
Base Chart Class
*/

class Chart {
  id          = undefined;
  svg         = undefined;
  width       = undefined;
  height      = undefined;
  margin      = undefined;
  padding     = undefined;
  palette     = undefined;
  data        = undefined;
  mapping     = undefined;

  constructor (config) {

    let self = this;

      // Configurable Parameters
      self.id          = config.id;
      self.width       = config.width;
      self.height      = config.height;
      self.position    = config.position;
      self.margin      = config.margin;
      self.padding     = config.padding;
      self.palette     = config.palette;
      self.data        = config.data;
      self.accessors   = config.accessors;

      // Computed References
      self.uid         = self.#uid();
      self.setID       = self.#setID();
      self.getID       = self.#getID();

      self.viewframe       = {
          height         : self.height,
          width          : self.width,
          top            : self.position.top,
          left           : self.position.left,
          bottom         : self.height - self.position.bottom,
          right          : self.width - self.position.right,
      };
      self.axisframe   = {
          height         : self.viewframe.height - self.margin.top - self.margin.bottom,
          width          : self.viewframe.width - self.margin.left - self.margin.right,
          top            : self.viewframe.top + self.margin.top,
          left           : self.viewframe.left + self.margin.left,
          bottom         : self.viewframe.bottom - self.margin.bottom,
          right          : self.viewframe.right - self.margin.right,
      };
      self.dataframe   = {
          height         : self.axisframe.height - self.padding.top - self.padding.bottom,
          width          : self.axisframe.width - self.padding.left - self.padding.right,
          top            : self.axisframe.top + self.padding.top,
          left           : self.axisframe.left + self.padding.left,
          bottom         : self.axisframe.bottom - self.padding.bottom,
          right          : self.axisframe.right - self.padding.right,
      };

      return self;

  }

  /*
  ID Methods
  */

  #uid () {
    return `O-${Math.random().toString(16).slice(2, 8)}`;
  }

  #setID () {
    let self = this;

    return `${self.id.replace("#", "")}_${self.uid}`;
  }

  #getID () {
    let self = this;

    return `${self.id}_${self.uid}`;
  }

  getUniqueValuesByKey (data, key) {
    return [...new Set(data.map(d => d[key]))];
  }
  getUniqueValues (data) {
    return [...new Set(array)];
  }

  /*
  Utility Methods
  */

  tokenize (token) {
    return (typeof(token) === "string") ? token.replace(/\s/g, "-").toLowerCase() : `${Math.random().toString(16).slice(2, 6)}`.toLowerCase();
  }

  debug () {
    console.info(self);
  }

}

export default Chart;
