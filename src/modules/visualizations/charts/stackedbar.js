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
Stacked Bar Chart Class
*/

class StackedBarChart extends Chart {

  constructor (config) {

    // Configure Parent
    super(config);

    let self = this;

    // Configure Stacked Bar Chart
    self.accessors        = config.accessors;
    self.rotate           = config.rotate;
    self.transitions      = config.transitions;
    self.animations       = config.animations;
    self.legend           = Object.hasOwn(config, "legend") ? config.legend : undefined;
    self.tooltip          = Object.hasOwn(config, "tooltip") ? config.tooltip : undefined;
    self.filters          = Object.hasOwn(config, "filters") ? config.filters : undefined;
    self.ordering         = {
      "appearance" : D3.stackOrderAppearance,
      "ascending"  : D3.stackOrderAscending,
      "descending" : D3.stackOrderDescending,
      "insideout"  : D3.stackOrderInsideOut,
      "reverse"    : D3.stackOrderReverse,
      "none"       : D3.stackOrderNone
    }[config.ordering];

    /*
    Setup
    */

    // Get Unique Groups and Subgroups
    self.groups = super.getUniqueValuesByKey(self.data, self.accessors.group.key);
    self.subgroups = super.getUniqueValuesByKey(self.data, self.accessors.subgroup.key);

    // Color Scale
    self.colorscale = D3.scaleOrdinal()
      .domain(self.subgroups)
      .range(self.palette);

    // Get Mapping
    self.mapping = self.#mapData(self.data);

    // Set Colors
    self.colors = self.mapping.colors;

    // Ordering by Rotation
    if (self.rotate) {
      self.groups = self.groups.reverse();
    }

    // Filters
    if (self.filters !== undefined) {
      self.filters.values = ["All"];
      self.filters.values.push(...self.subgroups);
    }

    /*
    Get Visualization and Interface Elements
    */

    // Visualization Parent
    self.svg = (self.rotate)
      ? D3.select(`${self.getID}_visualization`)
        .classed("stacked-bar-chart isrotated", true)
        .attr("id", `${self.setID}_visualization`)
      : D3.select(`${self.getID}_visualization`)
        .classed("stacked-bar-chart unrotated", true)
        .attr("id", `${self.setID}_visualization`);

    // Interface Parent
    self.interface = D3.select(`${self.getID}_interface`)
      .attr("id", `${self.setID}_interface`);

    /*
    Generate Axes
    */

    self.x = (self.rotate)
      ? D3.scaleLinear()
        .domain([self.mapping.min, self.mapping.max])
        .range([0, self.dataframe.width])
      : D3.scaleBand()
        .domain(self.groups)
        .range([0, self.dataframe.width])
        .round(D3.enableRounding)
        .paddingInner(0.05);

    self.y = (self.rotate)
      ? D3.scaleBand()
        .domain(self.groups)
        .range([self.dataframe.height, 0])
        .round(D3.enableRounding)
        .paddingInner(0.05)
      : D3.scaleLinear()
        .domain([self.mapping.min, self.mapping.max])
        .range([self.dataframe.height, 0]);

    self.xAxis = (self.rotate)
      ? self.svg.append("g")
        .classed("x-axis", true)
        .attr("id", `${self.setID}_x-axis`)
        .attr("transform", `translate(${self.dataframe.left}, ${self.dataframe.bottom})`)
        .call(D3.axisBottom(self.x).tickSizeOuter(0))
      : self.svg.append("g")
        .classed("x-axis", true)
        .attr("id", `${self.setID}_x-axis`)
        .attr("transform", `translate(${self.dataframe.left}, ${self.dataframe.bottom})`)
        .call(D3.axisBottom(self.x).tickSizeOuter(0).tickPadding(4));

    self.yAxis = (self.rotate)
      ? self.svg.append("g")
        .classed("y-axis", true)
        .attr("id", `${self.setID}_y-axis_`)
        .attr("transform", `translate(${self.dataframe.right}, ${self.dataframe.top})`)
        .call(D3.axisRight(self.y).tickSizeOuter(0).tickPadding(4))
      : self.svg.append("g")
        .classed("y-axis", true)
        .attr("id", `${self.setID}_y-axis`)
        .attr("transform", `translate(${self.dataframe.right}, ${self.dataframe.top})`)
        .call(D3.axisRight(self.y).tickSizeOuter(0));

    self.xLabels = (self.rotate)
      ? self.xAxis
        .selectAll("text")
          .classed("label", true)
      : self.xAxis
        .selectAll(".tick")
          .data(self.groups)
          .attr("transform", d => `translate(${self.x(d) + 1}, 0)`)
          .selectAll("text")
            .classed("label interactable", true)
            .attr("id", d => `${self.setID}_label_${self.tokenize(d)}`)
            .on("mouseover", (e, d) => self.#mouseOverGroupAxis(e, d))
            .on("mouseout", (e, d) => self.#mouseOutGroupAxis(e, d));

    self.yLabels = (self.rotate)
      ? self.yAxis
        .selectAll(".tick")
          .data(self.groups)
          .attr("transform", d => `translate(0, ${self.y(d) + self.y.bandwidth() / 2})`)
          .selectAll("text")
            .classed("label interactable", true)
            .attr("id", d => `${self.setID}_label_${self.tokenize(d)}`)
            .on("mouseover", (e, d) => self.#mouseOverGroupAxis(e, d))
            .on("mouseout", (e, d) => self.#mouseOutGroupAxis(e, d))
      : self.yAxis
        .selectAll("text")
          .classed("label", true);


    /*
    Generate Data Elements
    */

    self.bars = self.svg
      .append("g")
        .classed(`bars data-elements`, true)
        .attr("id", `${self.setID}_bars`)
        .attr("transform", `translate(${self.dataframe.left}, ${self.dataframe.top})`);

    self.bargroups = self.bars
      .selectAll(".bar-group")
        .data(self.mapping.stacked)
        .join("g")
          .classed("bar-group data-element", true)
          .attr("id", d => `${self.setID}_bar-group_${self.tokenize(d.subgroup)}`)
          .attr("opacity", self.transitions.opacity.from);

    self.bar = (self.rotate)
    ? self.bargroups
      .selectAll("rect")
          .data(d => d)
          .enter()
            .append("rect")
            .classed("bar interactable", true)
            .attr("id", d => `${self.setID}_bar_${self.tokenize(d.group)}_${self.tokenize(d.subgroup)}`)
            .attr("data-group", d => d.group)
            .attr("x", d => self.x(d.from))
            .attr("y", d =>  self.y(d.group))
            .attr("width", d => self.x(d.to) - self.x(d.from))
            .attr("height", self.y.bandwidth())
            .attr("fill", d => d.color)
            .attr("opacity", self.transitions.opacity.from)
            .text(d =>  d.group)
            .on("mouseover", (e, d) => self.#mouseOverBar(e, d))
            .on("mouseout", (e, d) => self.#mouseOutBar(e, d))
    : self.bargroups
      .selectAll("rect")
          .data(d => d)
          .enter()
            .append("rect")
            .classed("bar interactable", true)
            .attr("id", d => `${self.setID}_bar_${self.tokenize(d.group)}_${self.tokenize(d.subgroup)}`)
            .attr("x", d => self.x(d.group))
            .attr("y", d =>  self.y(d.to))
            .attr("width", self.x.bandwidth())
            .attr("height", d =>  self.y(d.from) - self.y(d.to))
            .attr("fill", d => d.color)
            .attr("opacity", self.transitions.opacity.from)
            .text(d =>  d.group)
            .on("mouseover", (e, d) => self.#mouseOverBar(e, d))
            .on("mouseout", (e, d) => self.#mouseOutBar(e, d));

    /*
    Legend
    */

    self.Legend = (self.legend !== undefined)
      ? new Legend({
        uid: self.uid,
        setID: self.setID,
        getID: self.getID,
        getPrefix: `${self.getID}_bar-group`,
        container: self.viewframe,
        data: self.mapping.legend,
        color: self.color,
        transitions: self.transitions,
        animations: self.animations,
        width: self.legend.width,
        height: self.legend.height,
        itemsize: self.legend.itemsize,
        margin: self.margin,
        padding: self.legend.padding,
        fontsize: self.legend.fontsize,
        vposition: self.legend.vposition,
        hposition: self.legend.hposition,
        accessor: "key"
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
          self.accessors.group,
          self.accessors.color,
          self.accessors.value
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

    // Interface Parent
    self.interface = D3.select(`${self.getID}_interface`)
      .attr("id", `${self.setID}_interface`);

    // Grab SVG Generated From Vue Template
    self.svg = (self.rotate)
      ? D3.select(`${self.getID}_visualization`)
        .classed("stacked-bar-chart isrotated", true)
        .attr("id", `${self.setID}_visualization`)
      : D3.select(`${self.getID}_visualization`)
        .classed("stacked-bar-chart unrotated", true)
        .attr("id", `${self.setID}_visualization`);

    /*
    Generate Axes
    */

    self.x = (self.rotate)
      ? D3.scaleLinear()
        .domain([self.mapping.min, self.mapping.max])
        .range([0, self.dataframe.width])
      : D3.scaleBand()
        .domain(self.groups)
        .range([0, self.dataframe.width])
        .round(D3.enableRounding)
        .paddingInner(0.05);

    self.y = (self.rotate)
      ? D3.scaleBand()
        .domain(self.groups)
        .range([self.dataframe.height, 0])
        .round(D3.enableRounding)
        .paddingInner(0.05)
      : D3.scaleLinear()
        .domain([self.mapping.min, self.mapping.max])
        .range([self.dataframe.height, 0]);

    self.xAxis = (self.rotate)
      ? self.svg.append("g")
        .classed("axis x-axis", true)
        .attr("id", `${self.setID}_x-axis`)
        .attr("transform", `translate(${self.dataframe.left}, ${self.dataframe.bottom})`)
        .call(D3.axisBottom(self.x).tickSizeOuter(0))
      : self.svg.append("g")
        .classed("axis x-axis", true)
        .attr("id", `${self.setID}_x-axis`)
        .attr("transform", `translate(${self.dataframe.left}, ${self.dataframe.bottom})`)
        .call(D3.axisBottom(self.x).tickSizeOuter(0));

    self.yAxis = (self.rotate)
      ? self.svg.append("g")
        .classed("axis y-axis", true)
        .attr("id", `${self.setID}_y-axis_`)
        .attr("transform", `translate(${self.dataframe.right}, ${self.dataframe.top})`)
        .call(D3.axisRight(self.y).tickSizeOuter(0))
      : self.svg.append("g")
        .classed("axis y-axis", true)
        .attr("id", `${self.setID}_y-axis`)
        .attr("transform", `translate(${self.dataframe.right}, ${self.dataframe.top})`)
        .call(D3.axisRight(self.y).tickSizeOuter(0));

    self.xLabels = (self.rotate)
      ? self.xAxis
        .selectAll("text")
          .classed("label", true)
      : self.xAxis
        .selectAll(".tick")
          .data(self.groups)
          .attr("transform", d => `translate(${self.x(d) + 1}, 0)`)
          .selectAll("text")
            .classed("label interactable", true)
            .attr("id", d => `${self.setID}_label_${self.tokenize(d)}`)
            .on("mouseover", (e, d) => self.#mouseOverGroupAxis(e, d))
            .on("mouseout", (e, d) => self.#mouseOutGroupAxis(e, d));

    self.yLabels = (self.rotate)
      ? self.yAxis
        .selectAll(".tick")
          .data(self.groups)
          .attr("transform", d => `translate(0, ${self.y(d) + self.y.bandwidth() / 2})`)
          .selectAll("text")
            .classed("label interactable", true)
            .attr("id", d => `${self.setID}_label_${self.tokenize(d)}`)
            .on("mouseover", (e, d) => self.#mouseOverGroupAxis(e, d))
            .on("mouseout", (e, d) => self.#mouseOutGroupAxis(e, d))
      : self.yAxis
        .selectAll("text")
          .classed("label", true);

    /*
    Generate Data Elements
    */

    self.bars = self.svg.append("g")
        .classed(`bars data-elements`, true)
        .attr("id", `${self.setID}_bars`)
        .attr("transform", `translate(${self.dataframe.left}, ${self.dataframe.top})`);

    self.bargroups = self.bars.selectAll(".bar-group")
        .data(self.mapping.stacked)
        .join("g")
          .classed("bar-group data-element", true)
          .attr("id", d => `${self.setID}_bar-group_${self.tokenize(d.subgroup)}`)
          .attr("fill", d => d.color)
          .attr("opacity", self.transitions.opacity.from);

    self.bar = (self.rotate)
    ? self.bargroups
      .selectAll("rect")
          .data(d => d)
          .enter()
            .append("rect")
            .merge(self.bar)
            .classed("bar interactable", true)
            .attr("id", d => `${self.setID}_bar_${self.tokenize(d.group)}_${self.tokenize(d.subgroup)}`)
            .attr("data-group", d => d.group)
            .attr("x", d => self.x(d.from))
            .attr("y", d =>  self.y(d.group))
            .attr("width", d => self.x(d.to) - self.x(d.from))
            .attr("height", self.y.bandwidth())
            .attr("fill", d => d.color)
            .attr("opacity", self.transitions.opacity.from)
            .text(d =>  d.group)
            .on("mouseover", (e, d) => self.#mouseOverBar(e, d))
            .on("mouseout", (e, d) => self.#mouseOutBar(e, d))
    : self.bargroups
      .selectAll("rect")
          .data(d => d)
          .enter()
            .append("rect")
            .merge(self.bar)
            .classed("bar interactable", true)
            .attr("id", d => `${self.setID}_bar_${self.tokenize(d.group)}_${self.tokenize(d.subgroup)}`)
            .attr("x", d => self.x(d.group))
            .attr("y", d =>  self.y(d.to))
            .attr("width", self.x.bandwidth())
            .attr("height", d =>  self.y(d.from) - self.y(d.to))
            .attr("fill", d => d.color)
            .attr("opacity", self.transitions.opacity.from)
            .text(d =>  d.group)
            .on("mouseover", (e, d) => self.#mouseOverBar(e, d))
            .on("mouseout", (e, d) => self.#mouseOutBar(e, d));

    /*
    Legend
    */

    self.Legend = (self.legend !== undefined)
      ? new Legend({
        uid: self.uid,
        setID: self.setID,
        getID: self.getID,
        getPrefix: `${self.getID}_bar-group`,
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
          self.accessors.group,
          self.accessors.color,
          self.accessors.value
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

    self.xLabels.remove();
    self.yLabels.remove();
    self.xAxis.remove();
    self.yAxis.remove();
    self.bar.remove();
    self.bargroups.remove();
    self.bars.remove();
    if (self.Legend !== null) self.Legend.clear();
    if (self.Tooltip !== null) self.Tooltip.clear();
    if (self.Filters !== null) self.Filters.clear();

    return self;
  }

  /*
  Event Handlers
  */

  #mouseOverGroupAxis (e, g) {
    let self = this;

    // Highlight Selected Axis Group
    self.mapping.stacked.forEach(group => {
      group.forEach(d => {
        if (d.group === g) {
          D3.select(`${self.getID}_bar_${self.tokenize(d.group)}_${self.tokenize(d.subgroup)}`)
            .transition()
            .ease(Easing[self.animations.opacity.easing])
            .duration(self.animations.opacity.duration)
            .attr("opacity", self.transitions.opacity.to);
        }
      })
    });

    return self;
  }

  #mouseOutGroupAxis (e, g) {
    let self = this;

    D3.selectAll(`${self.getID}_visualization .bars .bar-group .bar`)
      .transition()
      .ease(Easing[self.animations.opacity.easing])
      .duration(self.animations.opacity.duration)
      .attr("opacity", self.transitions.opacity.from);

    return self;
  }

  #mouseOverBar (e, d) {
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

  #mouseOutBar (e, d) {
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
    let stacked = [];
    let subgroups = [];
    let colors = [];
    let legend = [];
    let maxs = [], mins = [];
    let from = [], to = [];

    // Finalize data structure
    data = data.map(datum => { return {
      group: datum[self.accessors.group.key],
      subgroup: datum[self.accessors.subgroup.key],
      color: self.colorscale(datum[self.accessors.color.key]),
      value: datum[self.accessors.value.key],
      from: 0,
      to: 0,
    }});

    // get Unique Colors
    colors.push(...super.getUniqueValuesByKey(data, "color"));
    subgroups.push(...super.getUniqueValuesByKey(data, "subgroup"));

    // Compute Group-wise Max and Min
    for (const i in self.groups) {
      let group = self.groups[i];
      let max = 0, min = 0;
      for (const j in data) {
        let datum = data[j];
        if (datum[self.accessors.group.key] === group) {
          max += datum[self.accessors.value.key];
          min = datum[self.accessors.value.key] < min ? datum[self.accessors.value.key] : min;
        }
      }
      maxs.push(max);
      mins.push(min);
    }

    // Generate Stacking
    for (const i in subgroups) {
      let subgroup = subgroups[i];
      let stack = [];
      let k = 0;
      for (const j in data) {
        let datum = data[j];
        if (datum.subgroup === subgroup) {
          if (typeof from[k] === 'undefined') {
            from.push(0);
          }
          datum.from = from[k];
          datum.to = from[k] + datum.value;
          from[k] = datum.to;
          stack.push(datum);
          k++;
        }
      }
      stack.subgroup = subgroup;
      stacked.push(stack);
      to = [];
    }

    // Generate Legend
    legend = D3.zip(colors, subgroups).map(([color, subgroup]) => {
      return {
        color: color,
        subgroup: subgroup
      }
    });

    return {
      data: data,
      stacked: stacked,
      // subgroups: subgroups,
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

export default StackedBarChart;
