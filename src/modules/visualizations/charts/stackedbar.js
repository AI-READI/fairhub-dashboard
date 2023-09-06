/*
Imports
*/

import * as D3 from "d3";
import Chart from "../chart.js";
import Legend from "../interfaces/legend.js";
import Tooltip from "../interfaces/tooltip.js";
import Filters from "../interfaces/filters.js";
import Easing from "../interfaces/easing.js";

/*
Stacked Bar Chart Class
*/

class StackedBarChart extends Chart {

  // References
  stacked     = undefined;
  color       = undefined;
  x           = undefined;
  y           = undefined;
  xAxis       = undefined;
  yAxis       = undefined;
  bars        = undefined;

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


    // Map Data
    self.mapping = self.#mapData(self.data);

    self.stacked = D3.stack()
      .keys(self.mapping.subgroups)
      .value((d, key) => {
        return d.value[key];
      })
      .order(self.ordering)(self.mapping.data);

    self.stacked.forEach((stack, i)  => {
      let subgroup = stack.key;
      stack.forEach((d, j) => {
        d.subgroup = self.tokenize(subgroup);
        d.value = d[1] - d[0];
        return d
      })
    });

    self.color = D3.scaleOrdinal()
      .domain(self.mapping.subgroups)
      .range(self.palette);

    // Setup Filters
    if (self.filters !== undefined) {
      self.filters.values = ["All"];
      self.filters.values.push(...self.mapping.subgroups);
    }

    self.interface = D3.select(`${self.getID}_interface`)
      .attr("id", `${self.setID}_interface`.replace("#", ""));

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
        .domain(self.mapping.groups)
        .range([0, self.dataframe.width])
        .round(D3.enableRounding)
        .paddingInner(0.05);

    self.y = (self.rotate)
      ? D3.scaleBand()
        .domain(self.mapping.groups)
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
          .data(self.mapping.data)
          .attr("transform", d => `translate(${self.x(d[self.accessors.group.key]) + 1}, 0)`)
          .selectAll("text")
            .classed("label interactable", true)
            .attr("id", d => `${self.setID}_label_${self.tokenize(d[self.accessors.group.key])}`)
            .on("mouseover", (e, d) => self.#mouseOverGroupAxis(e, d))
            .on("mouseout", (e, d) => self.#mouseOutGroupAxis(e, d));

    self.yLabels = (self.rotate)
      ? self.yAxis
        .selectAll(".tick")
          .data(self.mapping.data)
          .attr("transform", d => `translate(0, ${self.y(d[self.accessors.group.key]) + self.y.bandwidth() / 2})`)
          .selectAll("text")
            .classed("label interactable", true)
            .attr("id", d => `${self.setID}_label_${self.tokenize(d[self.accessors.group.key])}`)
            .on("mouseover", (e, d) => self.#mouseOverGroupAxis(e, d))
            .on("mouseout", (e, d) => self.#mouseOutGroupAxis(e, d))
      : self.yAxis
        .selectAll("text")
          .classed("label", true);


    /*
    Generate Data Elements
    */

    self.bars = self.svg.append("g")
        .classed(`bars data-element`, true)
        .attr("id", `${self.setID}_bars`)
        .attr("transform", `translate(${self.dataframe.left}, ${self.dataframe.top})`);

    self.bargroups = self.bars.selectAll(".bar-group")
        .data(self.stacked)
        .join("g")
          .classed("bar-group", true)
          .attr("id", d => `${self.setID}_bar-group_${self.tokenize(d.key)}`)
          .attr("fill", d => self.color(d.key))
          .attr("opacity", self.transitions.opacity.from);

    self.bar = (self.rotate)
    ? self.bargroups
      .selectAll("rect")
          .data(d => d)
          .enter()
            .append("rect")
            .classed("bar interactable", true)
            .attr("id", d => `${self.setID}_bar_${self.tokenize(d.data[self.accessors.group.key])}_${self.tokenize(d[self.accessors.color.key])}`)
            .attr("data-group", d => d.group)
            .attr("x", d => self.x(d[0]))
            .attr("y", d =>  self.y(d.data[self.accessors.group.key]))
            .attr("width", d => self.x(d[1]) - self.x(d[0]))
            .attr("height", self.y.bandwidth())
            .attr("opacity", self.transitions.opacity.from)
            .text(d =>  d.data[self.accessors.group.key])
            .on("mouseover", (e, d) => self.#mouseOverBar(e, d))
            .on("mouseout", (e, d) => self.#mouseOutBar(e, d))
    : self.bargroups
      .selectAll("rect")
          .data(d => d)
          .enter()
            .append("rect")
            .classed("bar interactable", true)
            .attr("id", d => `${self.setID}_bar_${self.tokenize(d.data[self.accessors.group.key])}_${self.tokenize(d[self.accessors.color.key])}`)
            .attr("x", d => self.x(d.data[self.accessors.group.key]))
            .attr("y", d =>  self.y(d[1]))
            .attr("width", self.x.bandwidth())
            .attr("height", d =>  self.y(d[0]) - self.y(d[1]))
            .attr("opacity", self.transitions.opacity.from)
            .text(d =>  d.data[self.accessors.group.key])
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
        data: self.stacked,
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
        accessors: self.accessors,
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








    return self;

  }

  update (filter) {

    let self = this;

    self.clear();

    /*
    Setup
    */

    filter = (filter === undefined) ? "All" : filter;

    // Map Data
    self.mapping = self.#mapData(self.data, filter);

    self.stacked = D3.stack()
      .keys(self.mapping.subgroups)
      .value((d, key) => {
        return d.value[key];
      })
      .order(self.ordering)(self.mapping.data);

    self.stacked.forEach((stack, i)  => {
      let subgroup = stack.key;
      stack.forEach((d, j) => {
        d.subgroup = self.tokenize(subgroup);
        d.value = d[1] - d[0];
        return d
      })
    });

    self.color = D3.scaleOrdinal()
      .domain(self.mapping.subgroups)
      .range(self.palette);

    self.interface = D3.select(`${self.getID}_interface`)
      .attr("id", `${self.setID}_interface`.replace("#", ""));

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
        .domain(self.mapping.groups)
        .range([0, self.dataframe.width])
        .round(D3.enableRounding)
        .paddingInner(0.05);

    self.y = (self.rotate)
      ? D3.scaleBand()
        .domain(self.mapping.groups)
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
          .data(self.mapping.data)
          .attr("transform", d => `translate(${self.x(d[self.accessors.group.key]) + 1}, 0)`)
          .selectAll("text")
            .classed("label interactable", true)
            .attr("id", d => `${self.setID}_label_${self.tokenize(d[self.accessors.group.key])}`)
            .on("mouseover", (e, d) => self.#mouseOverGroupAxis(e, d))
            .on("mouseout", (e, d) => self.#mouseOutGroupAxis(e, d));

    self.yLabels = (self.rotate)
      ? self.yAxis
        .selectAll(".tick")
          .data(self.mapping.data)
          .attr("transform", d => `translate(0, ${self.y(d[self.accessors.group.key]) + self.y.bandwidth() / 2})`)
          .selectAll("text")
            .classed("label interactable", true)
            .attr("id", d => `${self.setID}_label_${self.tokenize(d[self.accessors.group.key])}`)
            .on("mouseover", (e, d) => self.#mouseOverGroupAxis(e, d))
            .on("mouseout", (e, d) => self.#mouseOutGroupAxis(e, d))
      : self.yAxis
        .selectAll("text")
          .classed("label", true);


    /*
    Generate Data Elements
    */

    self.bars = self.svg.append("g")
        .classed(`bars data-element`, true)
        .attr("id", `${self.setID}_bars`)
        .attr("transform", `translate(${self.dataframe.left}, ${self.dataframe.top})`);

    self.bargroups = self.bars.selectAll(".bar-group")
        .data(self.stacked)
        .join("g")
          .classed("bar-group", true)
          .attr("id", d => `${self.setID}_bar-group_${self.tokenize(d.key)}`)
          .attr("fill", d => self.color(d.key))
          .attr("opacity", self.transitions.opacity.from);

    self.bar = (self.rotate)
    ? self.bargroups
      .selectAll("rect")
          .data(d => d)
          .enter()
            .append("rect")
            .classed("bar interactable", true)
            .attr("id", d => `${self.setID}_bar_${self.tokenize(d.data[self.accessors.group.key])}_${self.tokenize(d[self.accessors.color.key])}`)
            .attr("data-group", d => d.group)
            .attr("x", d => self.x(d[0]))
            .attr("y", d =>  self.y(d.data[self.accessors.group.key]))
            .attr("width", d => self.x(d[1]) - self.x(d[0]))
            .attr("height", self.y.bandwidth())
            .attr("opacity", self.transitions.opacity.from)
            .text(d =>  d.data[self.accessors.group.key])
            .on("mouseover", (e, d) => self.#mouseOverBar(e, d))
            .on("mouseout", (e, d) => self.#mouseOutBar(e, d))
    : self.bargroups
      .selectAll("rect")
          .data(d => d)
          .enter()
            .append("rect")
            .classed("bar interactable", true)
            .attr("id", d => `${self.setID}_bar_${self.tokenize(d.data[self.accessors.group.key])}_${self.tokenize(d[self.accessors.color.key])}`)
            .attr("x", d => self.x(d.data[self.accessors.group.key]))
            .attr("y", d =>  self.y(d[1]))
            .attr("width", self.x.bandwidth())
            .attr("height", d =>  self.y(d[0]) - self.y(d[1]))
            .attr("opacity", self.transitions.opacity.from)
            .text(d =>  d.data[self.accessors.group.key])
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
        data: self.stacked,
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
        accessors: self.accessors,
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

  #mouseOverGroupAxis (e, v) {
    let self = this;

    // Highlight Selected Axis Group
    self.stacked.forEach(group => {
      group.forEach(d => {
        if (d.data[self.accessors.group.key] === v) {
          D3.select(`${self.getID}_bar_${self.tokenize(d.data[self.accessors.group.key])}_${self.tokenize(d[self.accessors.color.key])}`)
            .transition()
            .ease(Easing[self.animations.opacity.easing])
            .duration(self.animations.opacity.duration)
            .attr("opacity", self.transitions.opacity.to);
        }
      })
    });

    return self;
  }

  #mouseOutGroupAxis (e, d) {
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
    this.Tooltip.update(e, d)
    return self;
  }

  #mouseOutBar (e, d) {
    let self = this;
    D3.select(e.target)
      .transition()
      .ease(Easing[self.animations.opacity.easing])
      .duration(self.animations.opacity.duration)
      .attr("opacity", self.transitions.opacity.from);
    this.Tooltip.clean(e, d)
    return self;
  }

  /*
  Map Data and Set Value Types
  */

  #mapData (values, filter) {

    let self = this;

    if (filter !== undefined && filter !== "All") {
      values = values.filter((value) => value[self.accessors.color.key] == filter);
    }

    let groups = super.getUniqueKeys(values, self.accessors.group.key);
    let subgroups = super.getUniqueKeys(values, self.accessors.color.key);
    let data = [];
    let maxs = [];
    let mins = [];
    let i = 0;

    for (let i in groups) {
      let group = groups[i];
      let datum = {group: group, value: {}};
      let max = 0;
      let min = 0;
      values.forEach(entry => {
        if (entry.group == group) {
          datum.value[entry.subgroup] = entry.value;
          max += entry.value
          min = entry.value < min ? entry.value : min;
        }
      });
      data.push(datum);
      maxs.push(max);
      mins.push(min);
    }

    return {
      groups: groups.reverse(),
      subgroups: subgroups,
      data: data.reverse(),
      max: Math.ceil(Math.max(...maxs)),
      min: Math.floor(Math.min(...mins))
    }

  }

}

/*
Exports
*/

export default StackedBarChart;
