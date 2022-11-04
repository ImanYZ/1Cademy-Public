import * as d3 from "d3";
import React, { useCallback } from "react";
import { UserTheme } from "src/knowledgeTypes";

// const columns = ["fruit", "vegetable"];

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
type Chapter = {
  [key: string]: number[];
};
type BoxData = {
  "Proposal Points": Chapter;
  "Question Points": Chapter;
  "Vote Points": Chapter;
};

function drawChart(svgRef: React.RefObject<SVGSVGElement>, data: Chapter, theme: UserTheme) {
  //   const data = [12, 5, 6, 6, 9, 10];
  //   const height = 120;
  //   const width = 250;
  const svg = d3.select(svgRef);

  // set the dimensions and margins of the graph
  const margin = { top: 10, right: 30, bottom: 20, left: 40 };
  const width = 400 - margin.left - margin.right;
  const height = 200 - margin.top - margin.bottom;
  const boxHeight = 25;
  const boxCenter = (idx: number) => 10 + idx * (boxHeight + margin.bottom / 2);

  svg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // create dummy data
  const x = d3.scaleLinear().domain([0, 60]).range([0, width]);
  svg.append("g").attr("transform", `translate(20,${height})`).call(d3.axisBottom(x).tickSizeOuter(0));

  const y = d3.scaleBand().domain(["A", "B", "C"]).range([height, 0]).padding(0.2);
  svg.append("g").attr("transform", `translate(20,0)`).call(d3.axisLeft(y));

  Object.keys(data)
    .map((key: string) => data[key])
    .map((d: number[], idx: number) => {
      drawBox(svg, boxHeight, boxCenter(idx), d, theme, x);
    });
}

const drawBox = (
  svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
  boxHeight: number,
  Boxcenter: number,
  data: number[],
  theme: UserTheme,
  x: d3.ScaleLinear<number, number, never>
) => {
  const data_sorted = data.sort(d3.ascending);
  const q1 = d3.quantile(data_sorted, 0.25);
  const median = d3.quantile(data_sorted, 0.5);
  const q3 = d3.quantile(data_sorted, 0.75);
  if (!q1 || !q3 || !median) return;

  const interQuantileRange = q3 - q1;
  const min = q1 - 1.5 * interQuantileRange;
  const max = q1 + 1.5 * interQuantileRange;
  console.log("stadistic", { q1, median, q3, min, max, xmin: x(min), xmax: x(max) });

  svg
    .append("line")
    .attr("x1", x(min))
    .attr("x2", x(max))
    .attr("y1", Boxcenter)
    .attr("y2", Boxcenter)
    .attr("stroke", theme === "Dark" ? "white" : "black")
    .attr("transform", `translate(20,0)`);
  // Show the box
  console.log("box", { x: x(q3), y: Boxcenter - boxHeight / 2, height: boxHeight, width: x(q1) - x(q3) });
  svg
    .append("rect")
    .attr("x", x(q1))
    .attr("y", Boxcenter - boxHeight / 2)
    .attr("height", boxHeight)
    .attr("width", x(q3) - x(q1))
    .style("fill", "rgb(255, 196, 152)")
    .attr("transform", `translate(20,0)`);
  // // show median, min and max horizontal lines
  svg
    .selectAll("toto")
    .data([min, max])
    .enter()
    .append("line")
    .attr("x1", d => x(d))
    .attr("x2", d => x(d))
    .attr("y1", Boxcenter - boxHeight / 2)
    .attr("y2", Boxcenter + boxHeight / 2)
    .attr("stroke", theme === "Dark" ? "white" : "black")
    .attr("transform", `translate(20,0)`);
  svg
    .selectAll("toto")
    .data([median])
    .enter()
    .append("line")
    .attr("x1", d => x(d))
    .attr("x2", d => x(d))
    .attr("y1", Boxcenter - boxHeight / 2)
    .attr("y2", Boxcenter + boxHeight / 2)
    .attr("stroke", "orange")
    .attr("transform", `translate(20,0)`);
};

type BoxChartProps = {
  theme: UserTheme;
};

export const BoxChart = ({ theme }: BoxChartProps) => {
  const svg = useCallback(
    (svgRef: any) => {
      console.log("svg callbak");
      drawChart(svgRef, data["Proposal Points"], theme);
    },
    [theme]
  );

  return <svg ref={svg} />;
};
// const data: BoxData = {
//   "The way of the program": {
//     "Proposal Points": [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
//     "Question Points": [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
//     "Vote Points": [11, 29, 11, 3, 12, 22, 13, 4, 15, 16, 1, 19, 2, 2, 11, 9],
//   },
//   "Variables, expressions and ...": {
//     "Proposal Points": [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
//     "Question Points": [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
//     "Vote Points": [11, 29, 11, 3, 12, 22, 13, 4, 15, 16, 1, 19, 2, 2, 11, 9],
//   },
//   Functions: {
//     "Proposal Points": [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
//     "Question Points": [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
//     "Vote Points": [11, 29, 11, 3, 12, 22, 13, 4, 15, 16, 1, 19, 2, 2, 11, 9],
//   },
// };

const data: BoxData = {
  "Proposal Points": {
    "The way of the program": [20, 23, 24, 24, 24, 25, 29, 31, 31, 33, 34, 36, 36, 37, 39, 39, 40, 40, 41, 45],
    "Variables, expressions and ...": [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
    Functions: [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
  },
  "Question Points": {
    "The way of the program": [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
    "Variables, expressions and ...": [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
    Functions: [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
  },
  "Vote Points": {
    "The way of the program": [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
    "Variables, expressions and ...": [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
    Functions: [12, 19, 11, 13, 12, 22, 13, 4, 15, 16, 18, 19, 0, 12, 11, 19],
  },
};
