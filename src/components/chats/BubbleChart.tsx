import * as d3 from "d3";
import React, { useCallback } from "react";

// const columns = ["fruit", "vegetable"];

const BUBBLE_MOCK = [
  { label: "Proposasl", radio: 100, x: 100, y: 100 },
  { label: "Proposasl", radio: 70, x: 200, y: 150 },
  { label: "Proposasl", radio: 20, x: 40, y: 300 },
  { label: "Proposasl", radio: 35, x: 200, y: 350 },
  { label: "Proposasl", radio: 15, x: 10, y: 75 },
  { label: "Proposasl", radio: 80, x: 300, y: 300 },
  { label: "Proposasl", radio: 35, x: 300, y: 75 },
];
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

function drawChart(svgRef: React.RefObject<SVGSVGElement>) {
  //   const data = [12, 5, 6, 6, 9, 10];
  //   const height = 120;
  //   const width = 250;
  const svg = d3.select(svgRef);

  // set the dimensions and margins of the graph
  const margin = { top: 10, right: 0, bottom: 20, left: 50 },
    width = 400 - margin.left - margin.right,
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
  // const subgroups = ["month", "apples", "bananas", "cherries", "dates"].slice(1);

  // List of groups = species here = value of the first column called group -> I show them on the X axis
  // const groups = data.map(d => d.month).flatMap(c => c);
  // console.log({ groups });

  // Add X axis
  // const x = d3.scaleBand().domain(groups).range([0, width]).padding(0.2);
  // svg.append("g").attr("transform", `translate(20, ${height})`).call(d3.axisBottom(x).tickSizeOuter(0));

  // Add Y axis
  // const y = d3.scaleLinear().domain([0, 60]).range([height, 0]);
  // svg.append("g").attr("transform", `translate(20, 0)`).call(d3.axisLeft(y));

  // color palette = one color per subgroup
  // const color = d3.scaleOrdinal().domain(subgroups).range(["#FF8A33", "#F9E2D0", "#A7D841", "#388E3C"]);

  //stack the data? --> stack per subgroup
  // const stackedData = d3.stack().keys(subgroups)(data);
  // console.log(stackedData);
  // Show the bars
  svg
    .append("g")
    .selectAll("circle")
    // Enter in the stack data = loop key per key = group per group
    .data(BUBBLE_MOCK)
    // .join("g")
    .join("circle")
    .attr("fill", "rgba(129, 199, 132, 0.6)")
    // .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    // .data(d => d)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    // .attr("height", d => y(d[0]) - y(d[1]))
    .attr("r", d => d.radio)
    .attr("stroke-width", 3)
    .attr("stroke", "rgb(129, 199, 132)")
    .attr("opacity", 0.8)
    .attr("text", "Hello World")
    .attr("transform", `translate(20, 0)`);
  svg
    .append("g")
    .selectAll("text")
    // Enter in the stack data = loop key per key = group per group
    .data(BUBBLE_MOCK)
    // .join("g")
    .join("text")
    .attr("fill", "rgb(129, 199, 132)")
    // .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    // .data(d => d)
    .attr("x", d => d.x)
    .attr("y", d => d.y)
    .attr("dominant-baseline", "middle")
    .attr("text-anchor", "middle")
    .text("9")
    .style("font-size", "34px");

  // .append("text")            // append text
  // .style("fill", "black")      // make the text black
  // .style("writing-mode", "tb") // set the writing mode
  // .attr("x", 200)         // set x position of left side of text
  // .attr("y", 100)         // set y position of bottom of text
  // .text("Hello World");   // define the text to display
}

export const BubbleChart = () => {
  console.log("PointsBarChart");
  //   const svg = useRef<SVGSVGElement>(null);

  //   useEffect(() => {
  //     console.log("call svg");
  //     drawChart(svg);
  //   }, [svg]);

  const svg = useCallback((svgRef: any) => {
    console.log("svg callbak");
    drawChart(svgRef);
  }, []);

  return <svg ref={svg} />;
};
