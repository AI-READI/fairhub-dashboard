/*
Imports
*/

import * as D3 from "d3";

/*
Prototype
*/

// Overview Visualization Entry Point
var Doughnut = function (config) {
    return this.__init__(config);
};

// Overview Visualization Methods
Doughnut.prototype = {

  __init__ : function (config) {
    let self = this;

    self.id         = config.id;
    self.margin     = config.margin;
    self.padding    = config.padding;
    self.width      = config.width;
    self.height     = config.height;
    self.radius     = config.radius;
    self.palette    = config.palette;

    self.inner      = {
      height: self.height - self.margin.top - self.margin.bottom,
      width: self.width - self.margin.left - self.margin.right
    }

    // self.data       = [
    //   {label: "healthy", value: 12},
    //   {label: "prediabetic", value: 1},
    //   {label: "diabetic", value: 13}
    // ]
    self.data       = {
      healthy: 119, prediabetic: 30, diabetic: 81
    }
    self.columns = ['healthy', 'prediabetic', 'diabetic'];

    self.svg = null;
    self.dougnut = null;
    self.color = null;
    self.arc = null;
    self.arcs = null;

    return self;

  },

  update: function () {
    let self = this;

    self.svg = D3.select(self.id)
      .append("g")
      .attr("transform", `translate(${self.inner.width / 2}, ${self.inner.height / 2})`);

    self.doughnut = D3.pie()
      .value(function (d) {return d[1]; })
      (Object.entries(self.data));

    // Set labels in datum objects
    for (let key in self.doughnut) {
      self.doughnut[key]["label"] = self.doughnut[key].data[0];
    }

    self.color = D3.scaleOrdinal()
      .domain(self.columns)
      .range(self.palette );

    self.dataArcs = D3.arc()
      .innerRadius(self.radius * 0.3)
      .outerRadius(self.radius * 0.7);

    self.labelArcs = D3.arc()
      .innerRadius(self.radius * 0.9)
      .outerRadius(self.radius * 0.9);

    self.arcs = self.svg
      .selectAll('.arcs')
        .data(self.doughnut)
        .join("path")
          .attr("d", self.dataArcs)
          .attr('fill', function (d) { return(self.color(d.label)) })
          .attr("stroke", "black")
          .style("stroke-width", "2px")
          .style("opacity", 0.7)

    self.labelLines = self.svg
      .selectAll('labellines')
      .data(self.doughnut)
      .enter()
      .append('polyline')
        .attr("stroke", "black")
        .style("fill", "none")
        .attr("stroke-width", 1)
        .attr('points', function(d) {
          var x = self.dataArcs.centroid(d); // line insertion in the slice
          var y = self.labelArcs.centroid(d); // line break: we use the other arc generator that has been built only for that
          var z = self.labelArcs.centroid(d); // Label position = almost the same as posB
          var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
          z[0] = self.radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
          return [x, y, z]
        })

    // Add the polylines between chart and labels:
    self.labels = self.svg
      .selectAll('labels')
      .data(self.doughnut)
      .enter()
      .append('text')
        .text( function (d) { return d.label } )
        .attr('transform', function (d) {
            var position = self.labelArcs.centroid(d);
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            position[0] = self.radius * 0.99 * (midangle < Math.PI ? 1 : -1);
            return 'translate(' + position + ')';
        })
        .style('text-anchor', function(d) {
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            return (midangle < Math.PI ? 'start' : 'end')
        })

  // .enter()
  // .append('path')
  // .attr('d', d3.arc()
  //   .innerRadius(100)         // This is the size of the donut hole
  //   .outerRadius(radius)
  // )
  // .attr('fill', function(d){ return(color(d.data.key)) })
  // .attr("stroke", "black")
  // .style("stroke-width", "2px")
  // .style("opacity", 0.7)

    // self.innerArc = D3.svg.arc()
    //   .innerRadius(self.radius * 0.4)
    //   .outerRadius(self.radius * 0.8);

    // self.outerArc = D3.svg.arc()
    //   .innerRadius(self.radius * 0.9)
    //   .outerRadius(self.radius * 0.9);

  //   self.arcs = self.svg.select(".arcs")
  //     .selectAll("path.arc")
  //     .data(self.doughnut(self.data), function (d) {return d.data.label})

  //   lice = svg.select(".slices").selectAll("path.slice")
  //   .data(pie(data), key);

  // slice.enter()
  //   .insert("path")
  //   .style("fill", function(d) { return color(d.data.label); })
  //   .attr("class", "slice");

  //   self.svg.append("g")
  //     .selectAll("g")
  //     .data(self.doughnut)
  //     .enter().append("path")
  //       .attr('d', d3.arc()
  //        .innerRadius(200)         // This is the size of the donut hole
  //        .outerRadius(self.inner.width / 2)
  //       )
  //       .attr("fill", function (d) { return self.color(d.data.key); })

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

export default Doughnut;
