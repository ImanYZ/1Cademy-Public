import * as d3 from "d3";
import React, { useCallback } from "react";

import { StackedBarStats } from "@/pages/instructors/dashboard";

// const columns = ["fruit", "vegetable"];
const LESS_EQUAL_THAN_10_COLOR = "rgb(255, 196, 153)";
const LESS_EQUAL_THAN_10_COLOR_ALPHA = "rgba(255, 196, 153, .75)";
const GREATER_THAN_10_COLOR = "rgb(249, 226, 208 )";
const GREATER_THAN_10_COLOR_ALPHA = "rgba(249, 226, 208, .75)";
const GREATER_THAN_50_COLOR = "rgb(167, 216, 65 )";
const GREATER_THAN_50_COLOR_ALPHA = "rgba(167, 216, 65, .75)";
const GREATER_THAN_100_COLOR = "rgb(56, 142, 60)";
const GREATER_THAN_100_COLOR_ALPHA = "rgba(56, 142, 60, .75)";

// var data1 = [
//   { index: 0, alessEqualTen: 12, bgreaterTen: 11, cgreaterFifty: 1, dgreaterHundred: 0 },
//   { index: 1, alessEqualTen: 7, bgreaterTen: 7, cgreaterFifty: 7, dgreaterHundred: 7 },
// ];
// // const data = [
// //   { category: "fruit", yes: 6, no: 7, maybe: 8 },
// //   { category: "vegetable", yes: 5, no: 4, maybe: 9 },
// // ];
// // const data = [
// //   { category: "fruit", yes: 6, no: 7, maybe: 8 },
// //   { category: "vegetable", yes: 5, no: 4, maybe: 9 },
// // ];

// const chartWidth = 100;
// const chartHeight = 100;

function drawChart(svgRef: SVGGElement, data: StackedBarStats[], maxAxisY: number) {
  //   const data = [12, 5, 6, 6, 9, 10];
  //   const height = 120;
  //   const width = 250;
  const svg = d3.select(svgRef);

  // set the dimensions and margins of the graph
  const margin = { top: 10, right: 0, bottom: 20, left: 50 },
    width = 250 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  //   const svg = d3
  //     .select("#my_dataviz")
  //     .append("svg")
  //     .attr("width", width + margin.left + margin.right)
  //     .attr("height", height + margin.top + margin.bottom)
  //     .append("g")
  //     .attr("transform", `translate(${margin.left},${margin.top})`);
  svg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // List of subgroups = header of the csv files = soil condition here
  const subgroups = ["index", "alessEqualTen", "bgreaterTen", "cgreaterFifty", "dgreaterHundred"].slice(1);

  // List of groups = species here = value of the first column called group -> I show them on the X axis
  // const groups = data.map(d => d.index).flatMap(c => c);
  // console.log({ groups });

  const columns = ["Proposals", "Questions"];

  // remove axis if exist to avoid overdrawing
  svg.select("#axis-x").remove();
  svg.select("#axis-y").remove();

  // Add X axis
  const x = d3.scaleBand().domain(columns).range([0, width]).padding(0.2);
  svg
    .append("g")
    .attr("id", "axis-x")
    .attr("transform", `translate(25, ${height + 5})`)
    .call(d3.axisBottom(x).tickSizeOuter(0));

  // Add Y axis
  const y = d3.scaleLinear().domain([0, maxAxisY]).range([height, 0]);
  svg.append("g").attr("id", "axis-y").attr("transform", `translate(25, 5)`).call(d3.axisLeft(y));

  // color palette = one color per subgroup
  const colorApha = d3
    .scaleOrdinal()
    .domain(subgroups)
    .range([
      LESS_EQUAL_THAN_10_COLOR_ALPHA,
      GREATER_THAN_10_COLOR_ALPHA,
      GREATER_THAN_50_COLOR_ALPHA,
      GREATER_THAN_100_COLOR_ALPHA,
    ]);
  const color = d3
    .scaleOrdinal()
    .domain(subgroups)
    .range([LESS_EQUAL_THAN_10_COLOR, GREATER_THAN_10_COLOR, GREATER_THAN_50_COLOR, GREATER_THAN_100_COLOR]);
  //stack the data? --> stack per subgroup
  const stackedData = d3.stack().keys(subgroups)(data);

  //tooltip
  const tooltip = d3.select("#tool-tip");
  // .append("div");
  // .style("position", "absolute")
  // .style("opacity", 0)
  // .attr("class", "tooltip")
  // .style("background-color", "#303134")
  // .style("border-radius", "5px")
  // .style("padding", "10px");
  svg

    .select("#bars")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .join("g")
    .attr("fill", d => colorApha(d.key) as string)
    .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data(d => d)
    .join("rect")
    .on("mouseover", function (e, d) {
      const _this = this as any;
      if (!_this || !_this.parentNode) return;
      const parentNode = _this.parentNode as any;
      const selectedNode = d3.select(parentNode) as any;
      const subgroupName = selectedNode.datum().key;
      const subGroupValue = d.data[subgroupName];
      const middle = y((3 * (d[0] + d[1])) / 4);
      d3.select(this)
        .transition()
        .style("fill", color(subgroupName) as string);
      tooltip
        .html("subgroup: " + subgroupName + "<br>" + "Value" + subGroupValue)
        .style("opacity", 1)
        .style("top", `${middle}px`)
        .style("left", `${1.6 * x.bandwidth()}px`);
    })
    .on("mouseout", function () {
      const _this = this as any;
      if (!_this || !_this.parentNode) return;

      const parentNode = _this.parentNode as any;
      const selectedNode = d3.select(parentNode) as any;
      const subgroupName = selectedNode.datum().key;
      d3.select(this)
        .transition()
        .style("fill", colorApha(subgroupName) as string);
      tooltip.style("opacity", 0).style("pointer-events", "none");
    })
    .attr("x", d => {
      const x1: number = d.data["index"];
      return x(columns[x1]) ?? 0;
    })
    .attr("y", d => y(d[1]))
    .attr("height", d => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .attr("transform", `translate(25, 5)`);
}

type StackedBarProps = {
  data: StackedBarStats[];
  maxAxisY: number;
};
export const PointsBarChart = ({ data, maxAxisY }: StackedBarProps) => {
  //   const svg = useRef<SVGSVGElement>(null);

  //   useEffect(() => {
  //     console.log("call svg");
  //     drawChart(svg);
  //   }, [svg]);

  const svg = useCallback(
    (svgRef: any) => {
      drawChart(svgRef, data, maxAxisY);
    },
    [data, maxAxisY]
  );

  return (
    <div id="box-plot-container" style={{ position: "relative" }}>
      <svg ref={svg}>
        <g id="bars"></g>
      </svg>
      <div
        id="tool-tip"
        style={{
          position: "absolute",
          background: "#303134",
          boxShadow: "0 1px 1px 1px black",
          borderRadius: "2px",
          opacity: "0",
          padding: "2px 4px",
          color: "white",
        }}
      ></div>
    </div>
  );
};
