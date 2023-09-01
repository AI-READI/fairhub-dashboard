/*
Imports
*/

import * as D3 from "d3";
import Chart from "../chart.js";
import Legend from "../interfaces/legend.js";
import Tooltip from "../interfaces/tooltip.js";
import Filters from "../interfaces/filters.js";

/*
Stacked Bar Chart Class
*/

class StackedBarChart extends Chart {

  // References
  parent      = undefined;
  groups      = undefined;
  subgroups   = undefined;
  stacked     = undefined;
  color       = undefined;
  x           = undefined;
  y           = undefined;
  xAxis       = undefined;
  yAxis       = undefined;
  bars        = undefined;
  annotation  = undefined;

  constructor (config) {

    // Configure Parent
    super(config);

    let self = this;

    // Configure Stacked Bar Chart
    self.opacity          = config.opacity;
    self.legend           = Object.hasOwn(config, "legend") ? config.legend : undefined;
    self.tooltip          = Object.hasOwn(config, "tooltip") ? config.tooltip : undefined;
    self.filters          = Object.hasOwn(config, "filters") ? config.filters : undefined;
    self.accessors        = config.accessors;
    self.rotate           = config.rotate;
    self.ordering         = {
      "appearance" : D3.stackOrderAppearance,
      "ascending"  : D3.stackOrderAscending,
      "descending" : D3.stackOrderDescending,
      "insideout"  : D3.stackOrderInsideOut,
      "reverse"    : D3.stackOrderReverse,
      "none"       : D3.stackOrderNone
    }[config.order];

    self.transitionduration = 200;

    return self;

  }

  update () {

    let self = this;

    /*
    Setup
    */

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

    self.interface = D3.select(`${self.id}_interface`)
      .style("position", "relative")
      .style("right", `0px`);

    // Grab SVG Generated From Vue Template
    self.svg = (self.rotate)
      ? D3.select(`${self.id}_visualization`)
        .classed("stacked-bar-chart isrotated", true)
      : D3.select(`${self.id}_visualization`)
        .classed("stacked-bar-chart unrotated", true);

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
        .paddingInner(0.05);

    self.y = (self.rotate)
      ? D3.scaleBand()
        .domain(self.mapping.groups)
        .range([self.dataframe.height, 0])
        .paddingInner(0.05)
      : D3.scaleLinear()
        .domain([Math.floor(self.mapping.min), Math.ceil(self.mapping.max)])
        .range([self.dataframe.height, 0]);

    self.xAxis = (self.rotate)
      ? self.svg.append("g")
        .classed("x-axis", true)
        .attr("id", `x-axis_${self.uid}`)
        .attr("transform", `translate(${self.dataframe.left}, ${self.dataframe.bottom})`)
        .call(D3.axisBottom(self.x))
        .selectAll("text")
          .classed("label", true)
          .style("text-anchor", "center")
          .style("text-transform", "capitalize")
      : self.svg.append("g")
        .classed("x-axis", true)
        .attr("id", `x-axis_${self.uid}`)
        .attr("transform", `translate(${self.dataframe.left}, ${self.dataframe.bottom})`)
        .call(D3.axisBottom(self.x).tickSizeOuter(5).tickPadding(10))
        .selectAll(".tick")
          .data(self.mapping.data)
          .attr("transform", d => `translate(${self.x(d[self.accessors.group.key])}, 0)`)
          .selectAll("text")
            .attr("id", d => `label_${self.uid}_${self.tokenize(d[self.accessors.group.key])}`)
            .classed("label", true)
            .style("text-anchor", "start")
            .style("text-transform", "capitalize")
            .style("vertical-align", "middle")
            .style("line-height", "20px");

    self.yAxis = (self.rotate)
      ? self.svg.append("g")
        .classed("y-axis", true)
        .attr("id", `y-axis_${self.uid}`)
        .attr("transform", `translate(${self.dataframe.left}, ${self.dataframe.top})`)
        .call(D3.axisLeft(self.y).tickSizeOuter(5).tickPadding(10))
        .selectAll(".tick")
          .data(self.mapping.data)
          .attr("transform", d => `translate(0, ${self.y(d[self.accessors.group.key])})`)
          .selectAll("text")
            .attr("id", d => `label_${self.uid}_${self.tokenize(d[self.accessors.group.key])}`)
            .classed("label", true)
            .style("text-anchor", "center")
            .style("vertical-align", "middle")
            .style("text-transform", "capitalize")
            .style("line-height", "20px")
      : self.svg.append("g")
        .classed("y-axis", true)
        .attr("id", `y-axis_${self.uid}`)
        .attr("transform", `translate(${self.dataframe.left}, ${self.dataframe.top})`)
        .call(D3.axisLeft(self.y))
        .selectAll("text")
          .classed("label", true)
          .style("text-anchor", "center")
          .style("text-transform", "capitalize");

    /*
    Generate Data Elements
    */

    self.bars = (self.rotate)
      ? self.svg.append("g")
        .classed(`bars`, true)
        .attr("id", `bars_${self.uid}`)
        .attr("transform", `translate(${self.dataframe.left}, ${self.dataframe.top})`)
        .selectAll(".bar-group")
        .data(self.stacked)
        .join("g")
          .classed("bar-group", true)
          .attr("id", d => `bar-group_${self.tokenize(d.key)}_${self.uid}`)
          .attr("fill", d => self.color(d.key))
          .attr("opacity", self.opacity)
          .selectAll("rect")
          .data(d => d)
          .enter()
            .append("rect")
            .attr("id", d => `bar_${self.tokenize(d.data[self.accessors.group.key])}_${self.tokenize(d.data[self.accessors.color.key])}_${self.uid}`)
            .classed("bar", true)
            .attr("data-group", d => d.group)
            .attr("x", d => self.x(d[0]))
            .attr("y", d =>  self.y(d.data[self.accessors.group.key]))
            .attr("width", d => self.x(d[1]) - self.x(d[0]))
            .attr("height", self.y.bandwidth())
            .attr("opacity", self.opacity)
            .text(d =>  d.data[self.accessors.group.key])
            .style("cursor", "pointer")
            .on("mouseover", (e, d) => self.#mouseOverBar(e, d))
            .on("mouseout", (e, d) => self.#mouseOutBar(e, d))
      : self.svg.append("g")
        .classed(`bars`, true)
        .attr("id", `bars_${self.uid}`)
        .attr("transform", `translate(${self.dataframe.left}, ${self.dataframe.top})`)
        .selectAll(".bar-group")
        .data(self.stacked)
        .join("g")
          .classed("bar-group", true)
          .attr("id", d => `bar-group_${self.tokenize(d.key)}_${self.uid}`)
          .attr("fill", d => self.color(d.key))
          .attr("opacity", self.opacity)
          .selectAll("rect")
          .data(d => d)
          .enter()
            .append("rect")
            .attr("id", d => `bar_${self.tokenize(d.data[self.accessors.group.key])}_${self.tokenize(d.data[self.accessors.color.key])}_${self.uid}`)
            .classed("bar", true)
            .attr("x", d => self.x(d.data[self.accessors.group.key]))
            .attr("y", d =>  self.y(d[1]))
            .attr("width", self.x.bandwidth())
            .attr("height", d =>  self.y(d[0]) - self.y(d[1]))
            .attr("opacity", self.opacity)
            .text(d =>  d.data[self.accessors.group.key])
            .style("cursor", "pointer")
            .on("mouseover", (e, d) => self.#mouseOverBar(e, d))
            .on("mouseout", (e, d) => self.#mouseOutBar(e, d));

    /*
    Legend
    */

    self.Legend = (self.legend !== undefined)
      ? new Legend({
        id: self.id,
        uid: self.uid,
        parent: self.svg,
        container: self.viewframe,
        data: self.stacked,
        color: self.color,
        opacity: self.opacity,
        width: self.legend.width,
        height: self.legend.height,
        itemsize: self.legend.itemsize,
        margin: self.margin,
        padding: self.legend.padding,
        fontsize: self.legend.fontsize,
        vposition: self.legend.vposition,
        hposition: self.legend.hposition,
        accessor: "key",
        prefix: "bar-group"
      })
      : null;

    /*
    Tooltip
    */

    self.Tooltip = (self.tooltip !== undefined)
      ? new Tooltip({
        id: self.id,
        uid: self.uid,
        parent: self.svg,
        container: self.viewframe,
        width: self.tooltip.width,
        height: self.tooltip.height,
        itemsize: self.tooltip.itemsize,
        margin: self.margin,
        padding: self.tooltip.padding,
        fontsize: self.tooltip.fontsize,
        vposition: self.tooltip.vposition,
        hposition: self.tooltip.hposition,
        accessors: self.accessors
      })
      : null;

    return self;

  }

  /*
  Event Handlers
  */

  #mouseOverBar (e, d) {
    let self = this;
    D3.select(e.target).transition().duration(self.transitionduration).attr("opacity", 1.0);
    this.Tooltip.update(e, d)
    return self;
  }

  #mouseOutBar (e, d) {
    let self = this;
    D3.select(e.target).transition().duration(self.transitionduration).attr("opacity", self.opacity);
    this.Tooltip.clear(e, d)
    return self;
  }

  /*
  Map Data and Set Value Types
  */

  #mapData (values) {

    let self = this;
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
      groups: groups,
      subgroups: subgroups,
      data: data,
      max: Math.ceil(Math.max(...maxs)),
      min: Math.floor(Math.min(...mins))
    }

  }

}

/*
Exports
*/

export default StackedBarChart;
