import * as d3 from "d3";
import React, { useCallback } from "react";

export type HorizontalBarchartData = {
  label: string;
  amount: number;
}[];
type plotMargin = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type DrawChartInput = {
  svgRef: SVGGElement;
  data: HorizontalBarchartData;
  width: number;
  boxHeight: number;
  margin: plotMargin;
  offsetX: number;
};

function drawChart({ svgRef, data, width, boxHeight, margin, offsetX }: DrawChartInput) {
  const svg = d3.select(svgRef);

  // set the dimensions and margins of the graph
  // const margin = { top: 10, right: 0, bottom: 20, left: 40 };
  // const offsetY = 18;
  // width = width + OFFSET_X;
  // const mock: HorizontalBarchartData = [
  //   {
  //     label: "peiyan",
  //     amount: 40,
  //   },
  //   {
  //     label: "elijah-fox",
  //     amount: 30,
  //   },
  //   {
  //     label: "metzlera",
  //     amount: 20,
  //   },
  //   {
  //     label: "io",
  //     amount: 60,
  //   },
  //   {
  //     label: "max",
  //     amount: 55,
  //   },
  //   {
  //     label: "sam",
  //     amount: 0,
  //   },
  //   {
  //     label: "s",
  //     amount: 10,
  //   },
  //   {
  //     label: "u",
  //     amount: 46,
  //   },
  //   {
  //     label: "wang",
  //     amount: 99,
  //   },
  //   {
  //     label: "lars",
  //     amount: 87,
  //   },
  //   {
  //     label: "o",
  //     amount: 76,
  //   },
  // ];

  const height = 4 * boxHeight * data.length; // Height with padding and margin
  const widthProcessed = width - margin.left - margin.right;
  const heightProcessed = height - margin.top - margin.bottom;
  const max = data.reduce((max, value) => Math.max(max, value.amount), 0);
  const maxFieldLenght = data.reduce((max, value) => Math.max(max, value.label.length), 0);
  offsetX = maxFieldLenght * 6.5;
  console.log("maxFieldLenght", maxFieldLenght);
  // configure SVG's size and position
  svg
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // create group graphic types

  // remove old axis
  // svg.select(`#${identifier}-lines`).remove();
  svg.select(`#axis-y`).remove();
  svg.select(`#axis-x`).remove();

  // redraw svg
  const x = d3
    .scaleLinear()
    .domain([0, max + 5])
    .range([0, widthProcessed - offsetX]);
  svg
    .append("g")
    .attr("id", `axis-x`)
    .attr("transform", `translate(${offsetX},${heightProcessed})`)
    .call(d3.axisBottom(x).tickSizeOuter(0));

  const y = d3
    .scaleBand()
    .domain(data.map(student => student.label))
    .range([0, heightProcessed])
    .padding(0.2);
  svg.append("g").attr("id", `axis-y`).attr("transform", `translate(${offsetX},0)`).call(d3.axisLeft(y));

  // svg
  //   .select("#boxes")
  //   .selectAll("rect")
  //   .data(mock)
  //   .join("rect")
  //   .attr("x", x(0))
  //   .attr("y", d => y(d.student) ?? 0)
  //   .attr("height", boxHeight)
  //   .attr("width", d => x(d.contribution))
  //   .style("border-radius", "0 4px 4px 0")
  //   .style("fill", "#f58a42")
  //   .attr("transform", `translate(${offsetX},${offsetY})`);
  svg
    .select("#boxes")
    .selectAll("path")
    .data(data)
    .join("path")
    .attr("d", d => {
      const boxHeightProcessed = d.amount ? boxHeight / 2 : 0;

      return `M${x(0)},${y(d.label)}
        h${
          x(d.amount) - boxHeightProcessed
        } q${boxHeightProcessed},0 ${boxHeightProcessed},${boxHeightProcessed}  q0,${boxHeightProcessed}
        -${boxHeightProcessed},${boxHeightProcessed}
        h-${x(d.amount) - boxHeightProcessed} z`;
    })
    .style("fill", "#f58a42")
    .attr("transform", `translate(${offsetX},${boxHeight})`);

  //mesh
  // svg
  //   .select("#mesh")
  //   .selectAll("line")
  //   .data(Object.entries(mock))
  //   .join("line")
  //   .attr("x1", 0)
  //   .attr("x2", widthProcessed - offsetX)
  //   .attr("y1", d => d.boxCenter)
  //   .attr("y2", d => d.boxCenter)
  //   .attr("stroke", theme === "Dark" ? "rgba(224, 224, 224, .1)" : "rgba(0, 0, 0, .25)")
  //   .attr("stroke-width", "1")
  //   .attr("transform", `translate(${offsetX},${offsetY})`);
}

type BoxChartProps = {
  width: number;
  boxHeight: number;
  margin: plotMargin;
  offsetX: number;
  data: HorizontalBarchartData;
};

export const HorizontalBarsChart = ({ width, data, boxHeight, margin, offsetX }: BoxChartProps) => {
  const svg = useCallback(
    (svgRef: any) => {
      drawChart({ svgRef, data, width, boxHeight, margin, offsetX });
    },
    [data, width, boxHeight, margin, offsetX]
  );

  return (
    <div style={{ position: "relative" }}>
      <svg ref={svg}>
        <g id="mesh"></g>
        <g id="boxes"></g>
      </svg>
    </div>
  );
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
