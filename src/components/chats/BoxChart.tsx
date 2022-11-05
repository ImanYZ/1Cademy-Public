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

function drawChart(
  svgRef: React.RefObject<SVGSVGElement>,
  data: Chapter,
  identifier: string,
  theme: UserTheme,
  drawYAxis: boolean
) {
  //   const data = [12, 5, 6, 6, 9, 10];
  //   const height = 120;
  //   const width = 250;
  const svg = d3.select(svgRef);
  // d3.selectAll("*").remove();

  // set the dimensions and margins of the graph
  const MARGIN = { top: 10, right: 30, bottom: 20, left: 40 };
  const OFFSET_X = drawYAxis ? 120 : 0;
  const OFFSET_Y = 16;
  const INITIAL_WIDTH = 400 + OFFSET_X;
  const INITIAL_HEIGHT = 50 * Object.keys(data).length; // Height with padding and margin
  const BOX_HEIGHT = 25;
  const width = INITIAL_WIDTH - MARGIN.left - MARGIN.right;
  const height = INITIAL_HEIGHT - MARGIN.top - MARGIN.bottom;

  // configure svg
  svg
    .attr("width", INITIAL_WIDTH)
    .attr("height", INITIAL_HEIGHT)
    .append("g")
    .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

  svg.append("g").attr("id", "totos");
  svg.append("g").attr("id", "main");
  svg.append("g").attr("id", "boxes");
  svg.append("g").attr("id", "median");
  svg.append("g").attr("id", "locations");
  // remove old draw
  // svg.select(`#${identifier}-lines`).remove();
  svg.select(`#${identifier}-axis-y`).remove();
  svg.select(`#${identifier}-axis-x`).remove();

  // redraw
  const x = d3
    .scaleLinear()
    .domain([0, 80])
    .range([0, width - OFFSET_X]);
  svg
    .append("g")
    .attr("id", `${identifier}-axis-x`)
    .attr("transform", `translate(${OFFSET_X},${height})`)
    .call(d3.axisBottom(x).tickSizeOuter(0));

  const y = d3.scaleBand().domain(Object.keys(data)).range([height, 0]).padding(0.2);
  if (drawYAxis) {
    svg
      .append("g")
      .attr("id", `${identifier}-axis-y`)
      .attr("transform", `translate(${OFFSET_X},0)`)
      .call(d3.axisLeft(y));
  }

  const keys = Object.keys(data); /* .map(cur=>data[cur]) */

  const gg = (ddd: number[]) => {
    const dataSortedAscending = [...ddd].sort(d3.ascending);
    const dataSortedDescending = [...ddd].sort(d3.descending);
    const q1 = d3.quantile(dataSortedAscending, 0.25);
    const median = d3.quantile(dataSortedAscending, 0.5);
    const q3 = d3.quantile(dataSortedAscending, 0.75);
    if (!q1 || !q3 || !median) return;

    const interQuantileRange = q3 - q1;
    const inferiorLimit = q1 - 1.5 * interQuantileRange;
    const superiorLimit = q3 + 1.5 * interQuantileRange;

    const min = dataSortedAscending.find(c => c >= inferiorLimit);
    const max = dataSortedDescending.find(c => c <= superiorLimit);

    if (!min || !max) return null;
    return { min, max, q1, q3, median, positions: median };
  };

  // const lines = [];

  const G = keys
    .map(key => {
      const obj = data[key];
      const res = gg(obj);
      if (!res) return null;

      const yy = y(key);
      if (!yy) return null;

      return {
        min: res.min,
        max: res.max,
        x1: x(res.min),
        x2: x(res.max),
        q1: x(res.q1),
        q3: x(res.q3),
        boxCenter: yy,
        median: res.median,
      };
    })
    .flatMap(c => c || []);
  console.log("G", G);

  svg
    .select("#boxes")
    .selectAll("rect")
    .data(G)
    .join("rect")
    // .append("rect")
    .attr("x", d => d.q1)
    .attr("y", d => d.boxCenter - BOX_HEIGHT / 2)
    .attr("height", BOX_HEIGHT)
    .attr("width", d => d.q3 - d.q1)
    .style("fill", "rgba(255, 196, 152, 1)")
    .attr("transform", `translate(${OFFSET_X},${OFFSET_Y})`);
  svg
    // .join("g")
    .select("#main")
    .attr("id", `${identifier}-lines`)
    .selectAll("line")
    .data(G)
    .join("line")
    // .data(d => d)
    .attr("x1", d => d.x1)
    .attr("x2", d => d.x2)
    .attr("y1", d => d.boxCenter)
    .attr("y2", d => d.boxCenter)
    .attr("stroke", theme === "Dark" ? "white" : "black")
    .attr("transform", `translate(${OFFSET_X},${OFFSET_Y})`);

  const totoLines = G.map(cur => [
    { x: cur.min, boxCenter: cur.boxCenter },
    { x: cur.max, boxCenter: cur.boxCenter },
  ]).flatMap(c => c);
  svg
    .select("#totos")
    .selectAll("line")
    .data(totoLines)
    .join("line")
    .attr("x1", d => x(d.x))
    .attr("x2", d => x(d.x))
    .attr("y1", d => d.boxCenter - BOX_HEIGHT / 2)
    .attr("y2", d => d.boxCenter + BOX_HEIGHT / 2)
    .attr("stroke", theme === "Dark" ? "white" : "black")
    .attr("transform", `translate(${OFFSET_X},${OFFSET_Y})`);

  svg
    .select("#median")
    .selectAll("line")
    .data(G)
    .join("line")
    .attr("x1", d => x(d.median))
    .attr("x2", d => x(d.median))
    .attr("y1", d => d.boxCenter - BOX_HEIGHT / 2)
    .attr("y2", d => d.boxCenter + BOX_HEIGHT / 2)
    .attr("stroke", "#EC7115")
    .attr("stroke-width", "2px")
    .attr("transform", `translate(${OFFSET_X},${OFFSET_Y})`);

  const location =
    "M7 9.5C6.33696 9.5 5.70107 9.23661 5.23223 8.76777C4.76339 8.29893 4.5 7.66304 4.5 7C4.5 6.33696 4.76339 5.70107 5.23223 5.23223C5.70107 4.76339 6.33696 4.5 7 4.5C7.66304 4.5 8.29893 4.76339 8.76777 5.23223C9.23661 5.70107 9.5 6.33696 9.5 7C9.5 7.3283 9.43534 7.65339 9.3097 7.95671C9.18406 8.26002 8.99991 8.53562 8.76777 8.76777C8.53562 8.99991 8.26002 9.18406 7.95671 9.3097C7.65339 9.43534 7.3283 9.5 7 9.5ZM7 0C5.14348 0 3.36301 0.737498 2.05025 2.05025C0.737498 3.36301 0 5.14348 0 7C0 12.25 7 20 7 20C7 20 14 12.25 14 7C14 5.14348 13.2625 3.36301 11.9497 2.05025C10.637 0.737498 8.85652 0 7 0Z";
  svg
    .select("#locations")
    .selectAll("path")
    .data(G)
    .join("path")
    .attr("d", location)
    .attr("transform", d => `translate(${OFFSET_X + x(d.median) - 7},${d.boxCenter})`)
    .attr("fill", "#EF5350");
  // svg
  //   .select("#boxes")
  //   .selectAll("line")
  //   .data(totoLines)
  //   .join("line")
  //   .attr("x1", d => x(d[1]))
  //   .attr("x2", d => x(d[1]))
  //   .attr("y1", d => d[2] - BOX_HEIGHT / 2)
  //   .attr("y2", d => d[2] + BOX_HEIGHT / 2)
  //   .attr("stroke", theme === "Dark" ? "white" : "black")
  //   .attr("transform", `translate(${OFFSET_X},${BOX_HEIGHT / 2 + 9})`);
  // svg
  //   .select("g")
  //   .selectAll("toto")
  //   .data(G)
  //   .join("toto")
  //   .selectAll("line")

  // .data(d => [d.min, d.max])
  // .data(d => d)
  // .join("line")
  // .attr("x1", (d,s,ss) => x(d.))
  // .attr("x2", d => x(d))
  // .attr("y1",  - boxHeight / 2)
  // .attr("y2", boxCenter + boxHeight / 2)
  // .attr("stroke", theme === "Dark" ? "white" : "black")
  // .attr("transform", `translate(${offsetX},${boxHeight / 2 + 9})`);

  //   // svg
  //   //   .selectAll("toto")
  //   //   .data([min, max])
  //   //   .enter()
  //   //   .append("line")
  //   //   .attr("x1", d => x(d))
  //   //   .attr("x2", d => x(d))
  //   //   .attr("y1", boxCenter - boxHeight / 2)
  //   //   .attr("y2", boxCenter + boxHeight / 2)
  //   //   .attr("stroke", theme === "Dark" ? "white" : "black")
  //   //   .attr("transform", `translate(${offsetX},${boxHeight / 2 + 9})`);

  // Object.keys(data).forEach((key: string) => {
  //   const boxCenter = y(key);
  //   if (boxCenter) {
  //     drawBox(svg, BOX_HEIGHT, boxCenter, data[key], theme, x, OFFSET_X, key);
  //   }
  // });
}

// const drawBox = (
//   svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
//   boxHeight: number,
//   boxCenter: number,
//   data: number[],
//   theme: UserTheme,
//   x: d3.ScaleLinear<number, number, never>,
//   offsetX: number,
//   key: string
// ) => {
//   // const data_sorted = data.sort(d3.ascending);
//   const dataSortedAscending = [...data].sort(d3.ascending);
//   const dataSortedDescending = [...data].sort(d3.descending);
//   const q1 = d3.quantile(dataSortedAscending, 0.25);
//   const median = d3.quantile(dataSortedAscending, 0.5);
//   const q3 = d3.quantile(dataSortedAscending, 0.75);
//   if (!q1 || !q3 || !median) return;

//   const interQuantileRange = q3 - q1;
//   const inferiorLimit = q1 - 1.5 * interQuantileRange;
//   const superiorLimit = q3 + 1.5 * interQuantileRange;

//   const min = dataSortedAscending.find(c => c >= inferiorLimit);
//   const max = dataSortedDescending.find(c => c <= superiorLimit);

//   if (!min || !max) return;

//   // const min = q1 - 1.5 * interQuantileRange;
//   // const max = q3 + 1.5 * interQuantileRange;
//   console.log("stadistic:", key, { interQuantileRange, q1, median, q3, min, max, xmin: x(min), xmax: x(max) });

//   svg
//     .append("line")
//     .attr("x1", x(min))
//     .attr("x2", x(max))
//     .attr("y1", boxCenter)
//     .attr("y2", boxCenter)
//     .attr("stroke", theme === "Dark" ? "white" : "black")
//     .attr("transform", `translate(${offsetX},${boxHeight / 2 + 9})`);

//   // // Show the box
//   // // console.log("box", { x: x(q3), y: Boxcenter - boxHeight / 2, height: boxHeight, width: x(q1) - x(q3) });
//   // svg
//   //   .append("rect")
//   //   .attr("x", x(q1))
//   //   .attr("y", boxCenter - boxHeight / 2)
//   //   .attr("height", boxHeight)
//   //   .attr("width", x(q3) - x(q1))
//   //   .style("fill", "rgb(255, 196, 152)")
//   //   .attr("transform", `translate(${offsetX},${boxHeight / 2 + 9})`);

//   // // // show median, min and max horizontal lines
//   // svg
//   //   .selectAll("toto")
//   //   .data([min, max])
//   //   .enter()
//   //   .append("line")
//   //   .attr("x1", d => x(d))
//   //   .attr("x2", d => x(d))
//   //   .attr("y1", boxCenter - boxHeight / 2)
//   //   .attr("y2", boxCenter + boxHeight / 2)
//   //   .attr("stroke", theme === "Dark" ? "white" : "black")
//   //   .attr("transform", `translate(${offsetX},${boxHeight / 2 + 9})`);

//   // svg
//   //   .selectAll("toto")
//   //   .data([median])
//   //   .enter()
//   //   .append("line")
//   //   .attr("x1", d => x(d))
//   //   .attr("x2", d => x(d))
//   //   .attr("y1", boxCenter - boxHeight / 2)
//   //   .attr("y2", boxCenter + boxHeight / 2)
//   //   .attr("stroke", "orange")
//   //   .attr("transform", `translate(${offsetX},${boxHeight / 2 + 9})`);
// };

type BoxChartProps = {
  identifier: string;
  theme: UserTheme;
  data: Chapter;
  drawYAxis?: boolean;
};

export const BoxChart = ({ identifier, data, theme, drawYAxis = true }: BoxChartProps) => {
  const svg = useCallback(
    (svgRef: any) => {
      console.log("svg callbak");
      drawChart(svgRef, data, identifier, theme, drawYAxis);
    },
    [data, identifier, theme, drawYAxis]
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
