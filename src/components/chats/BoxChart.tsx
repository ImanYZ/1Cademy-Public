import * as d3 from "d3";
import React, { useCallback } from "react";
import { UserTheme } from "src/knowledgeTypes";

import { Chapter } from "../../pages/instructors/dashboard";

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

function drawChart(svgRef: React.RefObject<SVGSVGElement>, data: Chapter, theme: UserTheme, drawYAxis: boolean) {
  //   const data = [12, 5, 6, 6, 9, 10];
  //   const height = 120;
  //   const width = 250;
  const svg = d3.select(svgRef);

  // set the dimensions and margins of the graph
  const MARGIN = { top: 10, right: 30, bottom: 20, left: 40 };
  const INITIAL_WIDTH = 400;
  const INITIAL_HEIGHT = 60 * Object.keys(data).length; // Height with padding and margin
  const BOX_HEIGHT = 25;
  const OFFSET_X = 120;
  const width = INITIAL_WIDTH - MARGIN.left - MARGIN.right;
  const height = INITIAL_HEIGHT - MARGIN.top - MARGIN.bottom;

  svg
    .attr("width", INITIAL_WIDTH)
    .attr("height", INITIAL_HEIGHT)
    .append("g")
    .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

  // drawGrid(svg, width, height, OFFSET_X);
  // create dummy data
  const x = d3
    .scaleLinear()
    .domain([0, 80])
    .range([0, width - OFFSET_X]);
  svg.append("g").attr("transform", `translate(${OFFSET_X},${height})`).call(d3.axisBottom(x).tickSizeOuter(0));

  const y = d3.scaleBand().domain(Object.keys(data)).range([height, 0]).padding(0.2);
  if (drawYAxis) {
    svg.append("g").attr("transform", `translate(${OFFSET_X},0)`).call(d3.axisLeft(y));
  }

  Object.keys(data).forEach((key: string) => {
    const boxCenter = y(key);
    if (boxCenter) {
      drawBox(svg, BOX_HEIGHT, boxCenter, data[key], theme, x, OFFSET_X, key);
    }
  });
}

const drawBox = (
  svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
  boxHeight: number,
  boxCenter: number,
  data: number[],
  theme: UserTheme,
  x: d3.ScaleLinear<number, number, never>,
  offsetX: number,
  key: string
) => {
  // const data_sorted = data.sort(d3.ascending);
  const dataSortedAscending = [...data].sort(d3.ascending);
  const dataSortedDescending = [...data].sort(d3.descending);
  const q1 = d3.quantile(dataSortedAscending, 0.25);
  const median = d3.quantile(dataSortedAscending, 0.5);
  const q3 = d3.quantile(dataSortedAscending, 0.75);
  if (!q1 || !q3 || !median) return;

  const interQuantileRange = q3 - q1;
  const inferiorLimit = q1 - 1.5 * interQuantileRange;
  const superiorLimit = q3 + 1.5 * interQuantileRange;

  const min = dataSortedAscending.find(c => c >= inferiorLimit);
  const max = dataSortedDescending.find(c => c <= superiorLimit);

  if (!min || !max) return;

  // const min = q1 - 1.5 * interQuantileRange;
  // const max = q3 + 1.5 * interQuantileRange;
  console.log("stadistic:", key, { interQuantileRange, q1, median, q3, min, max, xmin: x(min), xmax: x(max) });

  svg
    .append("line")
    .attr("x1", x(min))
    .attr("x2", x(max))
    .attr("y1", boxCenter)
    .attr("y2", boxCenter)
    .attr("stroke", theme === "Dark" ? "white" : "black")
    .attr("transform", `translate(${offsetX},${boxHeight / 2 + 9})`);

  // Show the box
  // console.log("box", { x: x(q3), y: Boxcenter - boxHeight / 2, height: boxHeight, width: x(q1) - x(q3) });
  svg
    .append("rect")
    .attr("x", x(q1))
    .attr("y", boxCenter - boxHeight / 2)
    .attr("height", boxHeight)
    .attr("width", x(q3) - x(q1))
    .style("fill", "rgb(255, 196, 152)")
    .attr("transform", `translate(${offsetX},${boxHeight / 2 + 9})`);

  // // show median, min and max horizontal lines
  svg
    .selectAll("toto")
    .data([min, max])
    .enter()
    .append("line")
    .attr("x1", d => x(d))
    .attr("x2", d => x(d))
    .attr("y1", boxCenter - boxHeight / 2)
    .attr("y2", boxCenter + boxHeight / 2)
    .attr("stroke", theme === "Dark" ? "white" : "black")
    .attr("transform", `translate(${offsetX},${boxHeight / 2 + 9})`);

  svg
    .selectAll("toto")
    .data([median])
    .enter()
    .append("line")
    .attr("x1", d => x(d))
    .attr("x2", d => x(d))
    .attr("y1", boxCenter - boxHeight / 2)
    .attr("y2", boxCenter + boxHeight / 2)
    .attr("stroke", "orange")
    .attr("transform", `translate(${offsetX},${boxHeight / 2 + 9})`);
};

type BoxChartProps = {
  theme: UserTheme;
  data: Chapter;
  drawYAxis?: boolean;
};

export const BoxChart = ({ data, theme, drawYAxis = true }: BoxChartProps) => {
  const svg = useCallback(
    (svgRef: any) => {
      console.log("svg callbak");
      drawChart(svgRef, data, theme, drawYAxis);
    },
    [data, theme, drawYAxis]
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
