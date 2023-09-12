/*
Imports
*/

import * as D3 from "d3";
import Chart from "../chart.js";
import Legend from "../interfaces/legend.js";
import Tooltip from "../interfaces/tooltip.js";
import Filters from "../interfaces/filters.js";
import Easing from "../animations/easing.js";

/*
Line Chart Class
*/

class LineChart extends Chart {

  // Initialization
  constructor (config) {

    // Configure Parent
    super(config);

    let self = this;

    // Configure Line Chart
    self.linewidth        = config.linewidth;
    self.pointradius      = config.pointradius;
    self.accessors        = config.accessors;
    self.transitions      = config.transitions;
    self.animations       = config.animations;
    self.legend           = Object.hasOwn(config, "legend") ? config.legend : undefined;
    self.tooltip          = Object.hasOwn(config, "tooltip") ? config.tooltip : undefined;
    self.filters          = Object.hasOwn(config, "filters") ? config.filters : undefined;

    /*
    Setup
    */

    // Unique Subgroups
    self.subgroups = super.getUniqueValuesByKey(self.data, self.accessors.subgroup.key);

    // Color Scale
    self.colorscale = D3.scaleOrdinal()
      .domain(self.subgroups)
      .range(self.palette);

    // Mapping
    self.mapping = self.#mapData(self.data);

    // Unique Colors
    self.colors = self.mapping.colors;

    // Filters
    if (self.filters !== undefined) {
      self.filters.values = ["All"];
      self.filters.values.push(...self.subgroups);
    }

    /*
    Get Visualization and Interface Elements
    */

    // Visualization Parent
    self.svg = D3.select(`${self.getID}_visualization`)
      .classed("line-chart unrotated", true)
      .attr("id", `${self.setID}_visualization`);

    // Interface Parent
    self.interface = D3.select(`${self.getID}_interface`)
      .attr("id", `${self.setID}_interface`);

    /*
    Generate Axes
    */

    self.x = D3.scaleTime()
      .domain(D3.extent(self.mapping.data, d => new Date(d.x)))
      .range([0, self.dataframe.width]);

    self.y = D3.scaleLinear()
      .domain([self.mapping.min, self.mapping.max])
      .range([self.dataframe.height, 0]);

    self.xAxis = self.svg.append("g")
      .classed("x-axis", true)
      .attr("id", `${self.setID}_x-axis`)
      .attr("transform", `translate(${self.margin.left}, ${self.axisframe.height + self.margin.top})`)
      .call(D3.axisBottom(self.x).tickSizeOuter(5).tickPadding(10));

    self.yAxis = self.svg.append("g")
      .classed("y-axis", true)
      .attr("id", `${self.setID}_y-axis`)
      .attr("transform", `translate(${self.margin.left}, ${self.margin.top})`)
      .call(D3.axisLeft(self.y));

    /*
    Generate Data Elements
    */

    self.line = D3.line()
      .x(d => self.x(new Date(d.x)))
      .y(d => self.y(d.y));

    self.lines = self.svg
      .append("g")
      .classed("lines", true)
      .attr("id", d =>`${self.setID}_lines`)
      .attr("transform", `translate(${self.margin.left}, ${self.margin.top})`);

    self.lineseries = self.lines
      .selectAll(".line-series")
        .data(self.mapping.series)
        .join("path")
          .classed("line-series", true)
          .attr("id", d =>`${self.setID}_line-series_${self.tokenize(d.subgroup)}`)
          .attr("fill", "none")
          .attr("stroke", d => d.color)
          .attr("stroke-width", self.linewidth)
          .attr("opacity", self.transitions.opacity.from)
          .attr("d", d => self.line(d));

    self.points = self.svg
      .append("g")
      .classed("points", true)
      .attr("id", d =>`${self.setID}_points`)
      .attr("transform", `translate(${self.margin.left}, ${self.margin.bottom})`);

    self.pointseries = self.points
      .selectAll(".point-series")
      .data(self.mapping.series)
      .join("g")
        .classed("point-series", true)
        .attr("id", d => `${self.setID}_point-series_${self.tokenize(d.subgroup)}`)
        .attr("fill", d => d.color)
        .attr("stroke", d => d.color)
        .attr("opacity", self.transitions.opacity.from)
        .selectAll(".point")
          .data(d => d)
          .join("circle")
            .classed("point", true)
            .attr("cx", d => self.x(new Date(d.x)))
            .attr("cy", d => self.y(d.y))
            .attr("r", self.pointradius);

    /*
    Legend
    */

    self.Legend = (self.legend !== undefined)
      ? new Legend({
        uid: self.uid,
        setID: self.setID,
        getID: self.getID,
        getPrefix: `${self.setID}_lines`,
        accessors: self.accessors,
        container: self.viewframe,
        data: self.mapping.legend,
        transitions: self.transitions,
        animations: self.animations,
        width: self.legend.width,
        height: self.legend.height,
        itemsize: self.legend.itemsize,
        margin: self.margin,
        padding: self.legend.padding,
        fontsize: self.legend.fontsize,
        vposition: self.legend.vposition,
        hposition: self.legend.hposition
      })
      : null;

    /*
    Tooltip
    */

    self.Tooltip = (self.tooltip !== undefined)
      ? new Tooltip({
        uid: self.uid,
        setID: self.setID,
        getID: self.getID,
        container: self.viewframe,
        width: self.tooltip.width,
        height: self.tooltip.height,
        itemsize: self.tooltip.itemsize,
        margin: self.margin,
        padding: self.tooltip.padding,
        fontsize: self.tooltip.fontsize,
        vposition: self.tooltip.vposition,
        hposition: self.tooltip.hposition,
        accessors: [
          self.accessors.subgroup,
          self.accessors.x,
          self.accessors.y
        ]
      })
      : null;

    /*
    Filters
    */


    self.Filters = (self.filters !== undefined)
      ? new Filters({
        default: "All",
        uid: self.uid,
        setID: self.setID,
        getID: self.getID,
        container: self.viewframe,
        accessor: self.filters.accessor,
        width: self.filters.width,
        height: self.filters.height,
        itemsize: self.filters.itemsize,
        margin: self.margin,
        padding: self.filters.padding,
        fontsize: self.filters.fontsize,
        vposition: self.filters.vposition,
        hposition: self.filters.hposition,
        accessors: self.accessors,
        options: self.filters.values,
        parent: self
      })
      : null;

    return self;

  }

  // Update
  update (filter) {

    let self = this;

    self.clear();

    /*
    Setup
    */

    // Set Filter
    filter = (filter === undefined) ? "All" : filter;

    // Map Data
    self.mapping = self.#mapData(self.data, filter);

    /*
    Get Visualization and Interface Elements
    */

    // Visualization Parent
    self.svg = D3.select(`${self.getID}_visualization`)
      .classed("line-chart unrotated", true)
      .attr("id", `${self.setID}_visualization`);

    // Interface Parent
    self.interface = D3.select(`${self.getID}_interface`)
      .attr("id", `${self.setID}_interface`);

    /*
    Generate Axes
    */

    self.x = D3.scaleTime()
      .domain(D3.extent(self.mapping.data, d => new Date(d.x)))
      .range([0, self.dataframe.width]);

    self.y = D3.scaleLinear()
      .domain([self.mapping.min, self.mapping.max])
      .range([self.dataframe.height, 0]);

    self.xAxis = self.svg.append("g")
      .classed("x-axis", true)
      .attr("id", `${self.setID}_x-axis`)
      .attr("transform", `translate(${self.margin.left}, ${self.axisframe.height + self.margin.top})`)
      .call(D3.axisBottom(self.x).tickSizeOuter(5).tickPadding(10));

    self.yAxis = self.svg.append("g")
      .classed("y-axis", true)
      .attr("id", `${self.setID}_y-axis`)
      .attr("transform", `translate(${self.margin.left}, ${self.margin.top})`)
      .call(D3.axisLeft(self.y));

    /*
    Generate Data Elements
    */

    self.line = D3.line()
      .x(d => self.x(new Date(d.x)))
      .y(d => self.y(d.y));

    self.lines = self.svg
      .append("g")
      .classed("lines", true)
      .attr("id", d =>`${self.setID}_lines`)
      .attr("transform", `translate(${self.margin.left}, ${self.margin.top})`)
      .attr("opacity", self.transitions.opacity.from);

    self.lineseries = self.lines
      .selectAll(".line-series")
        .data(self.mapping.series)
        .join("path")
          .classed("line-series", true)
          .attr("id", d =>`${self.setID}_line-series_${self.tokenize(d.subgroup)}`)
          .attr("fill", "none")
          .attr("stroke", d => d.color)
          .attr("stroke-width", self.linewidth)
          .attr("opacity", self.transitions.opacity.from)
          .attr("d", d => self.line(d));

    self.points = self.svg
      .append("g")
      .classed("points", true)
      .attr("id", d =>`${self.setID}_points`)
      .attr("transform", `translate(${self.margin.left}, ${self.margin.bottom})`)
      .attr("opacity", self.transitions.opacity.from);

    self.pointseries = self.points
      .selectAll(".point-series")
      .data(self.mapping.series)
      .join("g")
        .classed("point-series", true)
        .attr("id", d => `${self.setID}_point-series_${self.tokenize(d.subgroup)}`)
        .attr("fill", d => d.color)
        .attr("stroke", d => d.color)
        .attr("opacity", self.transitions.opacity.from)
        .selectAll(".point")
          .data(d => d)
          .join("circle")
            .classed("point interactable", true)
            .attr("cx", d => self.x(new Date(d.x)))
            .attr("cy", d => self.y(d.y))
            .attr("r", self.pointradius)
            .on("mouseover", (e, d) => self.#mouseOverPoint(e, d))
            .on("mouseout", (e, d) => self.#mouseOutPoint(e, d));

    /*
    Legend
    */

    self.Legend = (self.legend !== undefined)
      ? new Legend({
        uid: self.uid,
        setID: self.setID,
        getID: self.getID,
        getPrefix: `${self.setID}_lines`,
        container: self.viewframe,
        data: self.mapping.legend,
        transitions: self.transitions,
        animations: self.animations,
        width: self.legend.width,
        height: self.legend.height,
        itemsize: self.legend.itemsize,
        margin: self.margin,
        padding: self.legend.padding,
        fontsize: self.legend.fontsize,
        vposition: self.legend.vposition,
        hposition: self.legend.hposition
      })
      : null;

    /*
    Tooltip
    */

    self.Tooltip = (self.tooltip !== undefined)
      ? new Tooltip({
        uid: self.uid,
        setID: self.setID,
        getID: self.getID,
        container: self.viewframe,
        width: self.tooltip.width,
        height: self.tooltip.height,
        itemsize: self.tooltip.itemsize,
        margin: self.margin,
        padding: self.tooltip.padding,
        fontsize: self.tooltip.fontsize,
        vposition: self.tooltip.vposition,
        hposition: self.tooltip.hposition,
        accessors: [
          self.accessors.subgroup,
          self.accessors.x,
          self.accessors.y
        ]
      })
      : null;

    /*
    Filters
    */


    self.Filters = (self.filters !== undefined)
      ? new Filters({
        default: filter,
        uid: self.uid,
        setID: self.setID,
        getID: self.getID,
        container: self.viewframe,
        accessor: self.filters.accessor,
        width: self.filters.width,
        height: self.filters.height,
        itemsize: self.filters.itemsize,
        margin: self.margin,
        padding: self.filters.padding,
        fontsize: self.filters.fontsize,
        vposition: self.filters.vposition,
        hposition: self.filters.hposition,
        accessors: self.accessors,
        options: self.filters.values,
        parent: self
      })
      : null;

    return self;

  }

  clear () {
    let self = this;

    self.xAxis.remove();
    self.yAxis.remove();
    self.lineseries.remove();
    self.pointseries.remove();
    self.lines.remove();
    self.points.remove();
    if (self.Legend !== undefined && self.Legend !== null) self.Legend.clear();
    if (self.Tooltip !== undefined && self.Tooltip !== null) self.Tooltip.clear();
    if (self.Filters !== undefined && self.Filters !== null) self.Filters.clear();

    return self;

  }

/*
Event Handlers
*/

  #mouseOverPoint (e, d) {
    let self = this;

    D3.select(e.target)
      .transition()
      .ease(Easing[self.animations.opacity.easing])
      .delay(self.animations.opacity.delay)
      .duration(self.animations.opacity.duration)
      .attr("opacity", self.transitions.opacity.to);

    this.Tooltip.update(e, d);

    return self;
  }

  #mouseOutPoint (e, d) {
    let self = this;

    D3.select(e.target)
      .transition()
      .ease(Easing[self.animations.opacity.easing])
      .duration(self.animations.opacity.duration)
      .attr("opacity", self.transitions.opacity.from);

    this.Tooltip.clean(e, d);

    return self;
  }

/*
Map Data and Set Value Types
*/

  #mapData (data, filter) {

    let self = this;

    if (filter !== undefined && filter !== "All") {
      data = data.filter((datum) => datum[self.accessors.subgroup.key] == filter);
    }

    let series = [];
    let subgroups = [];
    let colors = [];
    let legend = [];
    let maxs = [];
    let mins = [];

    // Remap Values from Accessor Keys to Fixed Keys
    data = data.map(datum => { return {
      x: datum[self.accessors.x.key],
      y: datum[self.accessors.y.key],
      subgroup: datum[self.accessors.subgroup.key],
      color: self.colorscale(datum[self.accessors.color.key]),
    }});

    // Get Unique Colors
    colors.push(...super.getUniqueValuesByKey(data, "color"));
    subgroups.push(...super.getUniqueValuesByKey(data, "subgroup"));

    // Compute Series-wise Max and Min Values
    for (const i in self.subgroups) {
      let subgroup = self.subgroups[i];
      let max = 0, min = Infinity;
      for (const j in data) {
        let datum = data[j];
        if (datum.subgroup === subgroup) {
          max = datum.y > max ? datum.y : max;
          min = datum.y < min ? datum.y : min;
        }
      }
      maxs.push(max);
      mins.push(min);
    }

    // Generate Series
    series.push(...D3.zip(subgroups, colors)
      .map(([subgroup, color]) => {
        let subseries = data.filter(datum => {return datum.subgroup === subgroup});
        subseries.subgroup = subgroup;
        subseries.color = color;
        return subseries;
      })
    );

    // Generate Legend
    legend.push(...D3.zip(subgroups, colors)
      .map(([subgroup, color]) => {
        return {
          subgroup: subgroup,
          color: color
        }
      })
    );

    return {
      data: data,
      series: series,
      subgroups: subgroups,
      colors: colors,
      legend: legend,
      max: Math.ceil(Math.max(...maxs)),
      min: Math.floor(Math.min(...mins))
    }

  }

}

/*
Exports
*/

export default LineChart;
