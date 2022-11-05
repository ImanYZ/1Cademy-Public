import * as d3 from "d3";
import React, { useCallback } from "react";

// const columns = ["fruit", "vegetable"];

const GREEN = "rgb(56, 142, 60)";
const GREEN_ALPHA = "rgba(129, 199, 132, 0.8)";
const RED = "rgb(239, 83, 80)";
const RED_ALPHA = "rgba(239, 83, 80, 0.8)";
const GRAY = "rgb(117, 117, 117)";
const GRAY_ALPHA = "rgba(237, 237, 237, 0.8)";
const ORANGE = "rgb(255, 138, 51)";
const ORANGE_ALPHA = "rgba(251, 204, 169, 0.8)";

const BUBBLE_MOCK = [
  { students: 30, votes: 170, points: 40 },
  { students: 70, votes: 150, points: 19 },
  { students: 70, votes: 350, points: 79 },
  { students: 30, votes: 270, points: 18 },
  { students: 25, votes: 330, points: 20 },
  { students: 35, votes: 120, points: 60 },
  { students: 20, votes: 340, points: -10 },
  { students: 10, votes: 140, points: 80 },
  { students: 30, votes: 110, points: 0 },
  { students: 15, votes: 370, points: -2 },
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
    width = 500 - margin.left - margin.right,
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
  const x = d3.scaleLinear().domain([0, 500]).range([0, width]);
  svg.append("g").attr("transform", `translate(30, ${height})`).call(d3.axisBottom(x).tickSizeOuter(0));

  // Add Y axis
  const y = d3.scaleLinear().domain([-10, 100]).range([height, 0]);
  svg.append("g").attr("transform", `translate(30, 0)`).call(d3.axisLeft(y));

  console.log({ x, y });
  // color palette = one color per subgroup
  // const color = d3.scaleLinear().domain([]).range(["#FF8A33", "#F9E2D0", "#A7D841", "#388E3C"]);
  const color = d3
    .scaleThreshold()
    .domain([-50, 0, 20, 100])
    .range(["white", RED_ALPHA, ORANGE_ALPHA, GREEN_ALPHA, "white"]);
  const borderColor = d3.scaleThreshold().domain([-10, 0, 20, 100]).range(["white", RED, ORANGE, GREEN, "white"]);

  svg
    .append("g")
    .selectAll("circle")
    // Enter in the stack data = loop key per key = group per group
    .data(BUBBLE_MOCK)
    // .join("g")
    .join("circle")
    .attr("fill", d => (d.points !== 0 ? color(d.points) : GRAY_ALPHA))
    // .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    // .data(d => d)
    .attr("cx", d => x(d.votes))
    .attr("cy", d => y(d.points))
    // .attr("height", d => y(d[0]) - y(d[1]))
    .attr("r", d => d.students)
    .attr("stroke-width", 2)
    .attr("stroke", d => (d.points !== 0 ? borderColor(d.points) : GRAY))
    .attr("opacity", 0.8)
    .attr("text", "Hello World")
    .attr("transform", `translate(30, 0)`);
  svg
    .append("g")
    .selectAll("text")
    // Enter in the stack data = loop key per key = group per group
    .data(BUBBLE_MOCK)
    // .join("g")
    .join("text")
    .attr("fill", d => (d.points !== 0 ? borderColor(d.points) : GRAY))
    // .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    // .data(d => d)
    .attr("x", d => x(d.votes))
    .attr("y", d => y(d.points))
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "central")
    // .text("2")
    .style("font-size", "24px");

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
