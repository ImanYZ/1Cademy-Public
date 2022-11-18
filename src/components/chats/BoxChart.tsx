import * as d3 from "d3";
import React, { useCallback } from "react";
import { UserTheme } from "src/knowledgeTypes";

import { BoxChapterStat, Chapter } from "../../pages/instructors/dashboard";

type boxPlotMargin = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

function drawChart(
  svgRef: SVGGElement,
  identifier: string,
  data: Chapter,
  width: number,
  boxHeight: number,
  margin: boxPlotMargin,
  offsetX: number,
  offsetY: number,
  drawYAxis: boolean,
  theme: UserTheme,
  maxX: number,
  minX: number,
  studentStats?: BoxChapterStat
) {
  const svg = d3.select(svgRef);

  // set the dimensions and margins of the graph
  // const margin = { top: 10, right: 0, bottom: 20, left: 40 };
  // const offsetY = 18;
  // width = width + OFFSET_X;
  const height = 50 * Object.keys(data).length; // Height with padding and margin
  const widthProcessed = width - margin.left - margin.right + (drawYAxis ? offsetX : 0);
  const heightProcessed = height - margin.top - margin.bottom;

  // configure SVG's size and position
  svg
    .attr("width", drawYAxis ? width + offsetX : width)
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
    .domain([minX, maxX + 5])
    .range([0, widthProcessed - offsetX]);
  svg
    .append("g")
    .attr("id", `axis-x`)
    .attr("transform", `translate(${offsetX},${heightProcessed})`)
    .call(d3.axisBottom(x).tickSizeOuter(0));

  const y = d3
    .scaleBand()
    .domain(
      Object.keys(data)
        .map(str => str.slice(0, 15) + (str.length > 15 ? "..." : ""))
        .reverse()
    )
    .range([heightProcessed, 0])
    .padding(0.2);

  const findLabel = (str: string) => {
    return Object.keys(data).find(x => x.includes(str.replace("...", "")));
  };

  if (drawYAxis) {
    const tooltip = d3.select(`#boxplot-label-tooltip-${identifier}`);
    svg
      .append("g")
      .attr("id", `axis-y`)
      .attr("transform", `translate(${offsetX},0)`)
      .call(d3.axisLeft(y))
      .on("mouseover", function (e) {
        const _this = this as any;
        d3.select(_this).style("cursor", "pointer");
        tooltip
          .html(`${findLabel(e.target.innerHTML)}`)
          .style("opacity", 1)
          .style("top", `${e.offsetY}px`)
          .style("left", `${offsetX}px`);
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
      });
  }

  const keys = Object.keys(data); /* .map(cur=>data[cur]) */

  // calculate statistic metrics like:
  // quantiles
  // median
  // min,max
  // current user's position
  const statistic = (data: number[]) => {
    const dataSortedAscending = [...data].sort(d3.ascending);
    const dataSortedDescending = [...data].sort(d3.descending);
    const q1 = d3.quantile(dataSortedAscending, 0.25);
    const median = d3.quantile(dataSortedAscending, 0.5);
    const q3 = d3.quantile(dataSortedAscending, 0.75);

    if (q1 === undefined || q3 === undefined || median === undefined) return;

    const interQuantileRange = q3 - q1;
    const inferiorLimit = q1 - 1.5 * interQuantileRange;
    const superiorLimit = q3 + 1.5 * interQuantileRange;
    const min = dataSortedAscending.find(c => c >= inferiorLimit);
    const max = dataSortedDescending.find(c => c <= superiorLimit);

    if (min === undefined || max === undefined) return null;
    return { min, max, q1, q3, median, positions: median };
  };

  //Statistics calcultation for all Chapters
  const statistics = keys
    .map(key => {
      const obj = data[key];
      const result = statistic(obj);
      if (!result) return null;

      const boxCenter = y(key.slice(0, 15) + (key.length > 15 ? "..." : ""));
      if (!boxCenter) return null;

      return {
        min: result.min,
        max: result.max,
        x1: x(result.min),
        x2: x(result.max),
        q1: x(result.q1),
        q3: x(result.q3),
        boxCenter: boxCenter,
        median: result.median,
        key,
      };
    })
    .flatMap(c => c || []);

  // Boxes' Body plot drawing
  svg
    .select("#boxes")
    .selectAll("rect")
    .data(statistics)
    .join("rect")
    .attr("x", d => d.q1)
    .attr("y", d => d.boxCenter - boxHeight / 2)
    .attr("height", boxHeight)
    .attr("width", d => d.q3 - d.q1)
    .style("fill", "rgba(255, 196, 152, 1)")
    .attr("transform", `translate(${offsetX},${offsetY})`);

  // Lines plot drawing
  svg
    .select("#lines")
    .selectAll("line")
    .data(statistics)
    .join("line")
    .attr("x1", d => d.x1)
    .attr("x2", d => d.x2)
    .attr("y1", d => d.boxCenter)
    .attr("y2", d => d.boxCenter)
    .attr("stroke", theme === "Dark" ? "white" : "black")
    .attr("transform", `translate(${offsetX},${offsetY})`);

  // (toto) min and max lines
  // data for toto lines
  const totoLines = statistics
    .map(cur => [
      { x: cur.min, boxCenter: cur.boxCenter },
      { x: cur.max, boxCenter: cur.boxCenter },
    ])
    .flatMap(c => c);

  // toto lines drawing
  svg
    .select("#totos")
    .selectAll("line")
    .data(totoLines)
    .join("line")
    .attr("x1", d => x(d.x))
    .attr("x2", d => x(d.x))
    .attr("y1", d => d.boxCenter - boxHeight / 2)
    .attr("y2", d => d.boxCenter + boxHeight / 2)
    .attr("stroke", theme === "Dark" ? "white" : "black")
    .attr("transform", `translate(${offsetX},${offsetY})`);

  // Median drawing
  svg
    .select("#median")
    .selectAll("line")
    .data(statistics)
    .join("line")
    .attr("x1", d => x(d.median))
    .attr("x2", d => x(d.median))
    .attr("y1", d => d.boxCenter - boxHeight / 2)
    .attr("y2", d => d.boxCenter + boxHeight / 2)
    .attr("stroke", "#EC7115")
    .attr("stroke-width", "2px")
    .attr("transform", `translate(${offsetX},${offsetY})`);

  // Location Icons Path

  // Locations Icons Drawing
  if (studentStats) {
    const locationIconPath =
      "M7 9.5C6.33696 9.5 5.70107 9.23661 5.23223 8.76777C4.76339 8.29893 4.5 7.66304 4.5 7C4.5 6.33696 4.76339 5.70107 5.23223 5.23223C5.70107 4.76339 6.33696 4.5 7 4.5C7.66304 4.5 8.29893 4.76339 8.76777 5.23223C9.23661 5.70107 9.5 6.33696 9.5 7C9.5 7.3283 9.43534 7.65339 9.3097 7.95671C9.18406 8.26002 8.99991 8.53562 8.76777 8.76777C8.53562 8.99991 8.26002 9.18406 7.95671 9.3097C7.65339 9.43534 7.3283 9.5 7 9.5ZM7 0C5.14348 0 3.36301 0.737498 2.05025 2.05025C0.737498 3.36301 0 5.14348 0 7C0 12.25 7 20 7 20C7 20 14 12.25 14 7C14 5.14348 13.2625 3.36301 11.9497 2.05025C10.637 0.737498 8.85652 0 7 0Z";

    svg
      .select("#locations")
      .selectAll("path")
      .data(statistics)
      .join("path")
      .attr("d", locationIconPath)
      .attr("transform", d => `translate(${offsetX + x(studentStats[d.key] ?? 0) - 7},${d.boxCenter})`)
      .attr("fill", "#EF5350");
  }

  //mesh
  svg
    .select("#mesh")
    .selectAll("line")
    .data(statistics)
    .join("line")
    .attr("x1", 0)
    .attr("x2", widthProcessed - offsetX)
    .attr("y1", d => d.boxCenter)
    .attr("y2", d => d.boxCenter)
    .attr("stroke", theme === "Dark" ? "rgba(224, 224, 224, .1)" : "rgba(0, 0, 0, .25)")
    .attr("stroke-width", "1")
    .attr("transform", `translate(${offsetX},${offsetY})`);
}

type BoxChartProps = {
  identifier: string;
  data: Chapter;
  width: number;
  boxHeight: number;
  margin: boxPlotMargin;
  offsetX: number;
  offsetY: number;
  drawYAxis?: boolean;
  theme: UserTheme;
  maxX: number;
  minX: number;
  studentStats?: BoxChapterStat;
};

export const BoxChart = ({
  identifier,
  data,
  width,
  boxHeight,
  margin,
  offsetX,
  offsetY,
  drawYAxis = true,
  theme,
  maxX,
  minX,
  studentStats,
}: BoxChartProps) => {
  const svg = useCallback(
    (svgRef: any) => {
      drawChart(
        svgRef,
        identifier,
        data,
        width,
        boxHeight,
        margin,
        offsetX,
        offsetY,
        drawYAxis,
        theme,
        maxX,
        minX,
        studentStats
      );
    },
    [identifier, data, width, boxHeight, margin, offsetX, offsetY, drawYAxis, theme, maxX, minX, studentStats]
  );

  return (
    <div style={{ position: "relative" }}>
      <svg ref={svg}>
        {/* <text
        style={{ fontSize: "16px", paddingBottom: "10px" }}
        fill={theme === "Dark" ? "white" : "black"}
        x={40}
        y={12}
      >
        Chapters{" "}
      </text> */}
        {/* <Typography sx={{ fontSize: "19px" }}> Proposal Points</Typography> */}
        <g id="mesh"></g>
        <g id="totos"></g>
        <g id="lines"></g>
        <g id="boxes"></g>
        <g id="median"></g>
        <g id="locations"></g>
      </svg>
      <div
        id={`boxplot-label-tooltip-${identifier}`}
        className={`tooltip-plot axis-y-label ${theme === "Light" ? "lightMode" : "darkMode"}`}
      ></div>
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
