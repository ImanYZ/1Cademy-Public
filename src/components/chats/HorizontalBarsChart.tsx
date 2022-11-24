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

  const height = 4 * boxHeight * data.length; // Height with padding and margin
  const widthProcessed = width - margin.left - margin.right;
  const heightProcessed = height - margin.top - margin.bottom;
  const max = data.reduce((max, value) => Math.max(max, value.amount), 0);
  const maxFieldLenght = data.reduce((max, value) => Math.max(max, value.label.length), 0);
  offsetX = maxFieldLenght * 6.5;
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
    .style("fill", "#EF5350")
    .attr("transform", `translate(${offsetX},${boxHeight})`);
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
