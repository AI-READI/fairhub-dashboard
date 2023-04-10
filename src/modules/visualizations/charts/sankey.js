/*
Imports
*/

import * as D3 from "d3";
import * as D3Sankey from "d3-sankey";
import Chart from "../chart.js";


/*
Sankey Chart Class
*/

class SankeyChart extends Chart {

  // References
  mapped    = undefined;
  sources   = undefined;
  targets   = undefined;
  nodes     = undefined;
  links     = undefined;
  color     = undefined;
  x         = undefined;
  y         = undefined;
  xAxis     = undefined;
  yAxis     = undefined;
  bars      = undefined;
  #alignMap = {
    "left"    : D3Sankey.sankeyLeft,
    "right"   : D3Sankey.sankeyRight,
    "center"  : D3Sankey.sankeyCenter,
    "justify" : D3Sankey.sankeyJustify
  };

  constructor (config) {

    // Configure Parent
    super(config);

    // Configure Sankey Chart
    this.opacity      = config.opacity;
    this.node         = config.node;
    this.link         = config.link;

    // Computed References
    this.nodeAlign    = this.#alignMap[this.node.alignment];
    this.linkMethod   = D3Sankey.sankeyLinkHorizontal();

    return this;

  }

  update () {

    this.svg = D3.select(this.id)
      .classed("sankey-chart", true);

    [this.mapped, this.sources, this.targets, this.nodes, this.links] = this.#mapData(this.data);

    this.graph = D3Sankey.sankey()
      .nodeId(d => d.name)
      .nodeAlign(this.nodeAlign)
      .nodeWidth(this.node.width)
      .nodePadding(this.node.padding)
      .size([this.width, this.height])
      .extent([[this.margin.left, this.margin.top], [this.width - this.margin.right, this.height - this.margin.bottom]])
      .nodes(this.mapped.nodes)
      .links(this.mapped.links)(this.mapped);

    // Layout sorting
    this.nodeSort = this.node.sort !== null ? this.graph.nodes.sort((a, b) => D3[this.node.sort](a.value, b.value)) : null;
    this.linkSort = this.link.sort !== null ? this.graph.links.sort((a, b) => D3[this.link.sort](a.value, b.value)) : null;

    /*
    Define Gradients
    */

    this.color = D3.scaleOrdinal(this.palette);

    this.gradients = this.svg.append("defs")
        .classed("gradient-defs", true)
        .attr("id", `gradient-defs_${this.uid}`)
        .style("mix-blend-mode", "multiply")
        .selectAll("linearGradient")
        .data(this.graph.links)
        .enter()
          .append("linearGradient")
            .classed("gradient", true)
            .attr("id", d => `gradient_${this.tokenize(d.source.name)}_${this.tokenize(d.target.name)}_${this.uid}`)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", d => d.source.x1)
            .attr("y1", d => Math.max(d.source.y0, d.target.y0, d.source.y1, d.target.y1))
            .attr("x2", d => d.target.x0)
            .attr("y2", d => Math.max(d.source.y0, d.target.y0, d.source.y1, d.target.y1));

    this.gradientsource = this.gradients
      .append("stop")
        .attr("offset", "5%")
        .attr("stop-color", d => d.color = this.color(this.tokenize(d.source.name)))
        .attr("stop-opacity", this.link.opacity);

    this.gradienttarget = this.gradients
      .append("stop")
        .attr("offset", "95%")
        .attr("stop-color", d => d.color = this.color(this.tokenize(d.target.name)))
        .attr("stop-opacity", this.link.opacity);

    /*
    Generate Data Elements
    */

    this.nodes = this.svg.append("g")
        .classed(`${this.node.class}s`, true)
        .attr("id", `nodes_${this.uid}`)
        .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
        .selectAll("rect")
        .data(this.graph.nodes)
        .enter()
          .append("rect")
            .classed(this.node.class, true)
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => this.color(this.tokenize(d.name)))
            .attr("opacity", this.node.opacity)
            .style("shape-rendering", "crispEdges");

    this.links = this.svg.append("g")
        .classed(`${this.link.class}s`, true)
        .attr("id", `links_${this.uid}`)
        .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
        .selectAll("path")
        .data(this.graph.links)
        .enter("path")
          .append("path")
            .classed(this.link.class, true)
            .attr("id", d => `link_${this.tokenize(d.source.name)}_${this.tokenize(d.target.name)}_${this.uid}`)
            .attr("d", d => d.path = this.linkMethod(d))
            .attr("fill", "none")
            .attr("stroke", d => `url(#gradient_${this.tokenize(d.source.name)}_${this.tokenize(d.target.name)}_${this.uid})`)
            .attr("stroke-width", d => d.width)
            .attr("stroke-linecap", "square")
            .attr("opacity", this.link.opacity)
            .attr("vector-effect", "none")
            .style("shape-rendering", "geometricPrecision");

    /*
    Generate Labels
    */

    this.nodelabels = this.svg.append("g")
        .classed(`${this.node.class}-labels`, true)
        .attr("id", `node-labels_${this.uid}`)
        .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
        .selectAll("text")
        .data(this.graph.nodes)
        .join("text")
          .text(d => `${d.name} (${d.value})`)
            .classed(`${this.node.class}-label`, true)
            .attr("id", d => `node-label_${this.tokenize(d.name)}_${this.uid}`)
            .attr("font-size", this.node.fontsize)
            .attr("x", d => d.x0)
            .attr("y", d => d.y0 - (this.node.fontsize / 2));

    return this;

  }

  #mapData (data) {

    let links = [];
    data.forEach(row => {
      links.push({
        target : super.asType(this.accessors.target.type, row[this.accessors.target.key]),
        source : super.asType(this.accessors.source.type, row[this.accessors.source.key]),
        value  : super.asType(this.accessors.value.type, row[this.accessors.value.key])
      });
    });

    let sources = super.getUniqueKeys(links, this.accessors.source.key);
    let targets = super.getUniqueKeys(links, this.accessors.target.key);
    let nodes = Array.from(new Set(targets.concat(sources)));

    let mapped = {
      nodes: nodes.map(
        node => {return {name: node}}
      ),
      links: links
    };

    return [mapped, sources, targets, nodes, links];

  }

};

/*
Exports
*/

export default SankeyChart;
