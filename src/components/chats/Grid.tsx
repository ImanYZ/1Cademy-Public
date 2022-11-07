import * as d3 from "d3";

export const drawGrid = (
  svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
  width: number,
  height: number,
  OFFSET_X: number
) => {
  let scale = d3.scaleLinear().domain([0, width]).range([0, height]);
  //   let axis = d3.axisLeft(scale).tickSize(500);
  svg
    .append("g")
    .attr("transform", `translate(${OFFSET_X},0)`)
    .attr("stroke-dasharray", `1 1`)
    // .attr("display", `none`)
    .call(d3.axisLeft(scale).tickSize(500));
};
