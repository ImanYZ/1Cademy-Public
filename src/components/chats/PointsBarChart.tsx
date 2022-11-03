import * as d3 from "d3";
import React, { useEffect, useRef } from "react";

// const columns = ["fruit", "vegetable"];

var data = [
  { month: new Date(2015, 0, 1), apples: 3840, bananas: 1920, cherries: 960, dates: 400 },
  { month: new Date(2015, 1, 1), apples: 1600, bananas: 1440, cherries: 960, dates: 400 },
  { month: new Date(2015, 2, 1), apples: 640, bananas: 960, cherries: 640, dates: 400 },
  { month: new Date(2015, 3, 1), apples: 320, bananas: 480, cherries: 640, dates: 400 },
];
// const data = [
//   { category: "fruit", yes: 6, no: 7, maybe: 8 },
//   { category: "vegetable", yes: 5, no: 4, maybe: 9 },
// ];
// const data = [
//   { category: "fruit", yes: 6, no: 7, maybe: 8 },
//   { category: "vegetable", yes: 5, no: 4, maybe: 9 },
// ];

function drawChart(svgRef: React.RefObject<SVGSVGElement>) {
  //   const data = [12, 5, 6, 6, 9, 10];
  const h = 120;
  const w = 250;
  const svg = d3.select(svgRef.current);

  //   const series = d3.stack().keys(columns)(data);
  var stack = d3
    .stack()
    .keys(["apples", "bananas", "cherries", "dates"])
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

  var series = stack(data);
  console.log("series", series);

  svg.attr("width", w).attr("height", h).style("margin-top", 50).style("margin-left", 50);

  //   const xScale = d3.scaleBand().domain(data.map([])).range([0, width]).padding(0.1);

  //   const yScale = d3
  //     .scaleLinear()
  //     .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
  //     .range([height, 0]);

  const rects = svg
    .append("g")
    .selectAll("g")
    .data(series)
    .enter()
    .append("g")
    .attr("fill", d => d.key);

  rects
    .selectAll("rect")
    .data(d => d)
    .join("rect");
  // .attr("x", (d, i) => xScale(d.data.category))
  // .attr("y", d => yScale(d[1]))
  // .attr("height", d => yScale(d[0]) - yScale(d[1]))
  // .attr("width", xScale.bandwidth());
  //   svg
  //     .selectAll("rect")
  //     .data(data)
  //     .enter()
  //     .append("rect")
  //     .attr("x", (d, i) => i * 40)
  //     .attr("y", (d, i) => h - 10 * d)
  //     .attr("width", 20)
  //     .attr("height", (d, i) => d * 10)
  //     .attr("fill", "steelblue");
}

export const PointsBarChart = () => {
  const svg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    drawChart(svg);
  }, [svg]);

  return <svg ref={svg} />;
};
