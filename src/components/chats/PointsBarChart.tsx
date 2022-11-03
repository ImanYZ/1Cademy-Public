import * as d3 from "d3";
import React, { useCallback } from "react";

// const columns = ["fruit", "vegetable"];

var data = [
  { month: "Proposasl", apples: 15, bananas: 17, cherries: 10, dates: 2 },
  { month: "Questions", apples: 8, bananas: 11, cherries: 8, dates: 1 },
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
  const subgroups = ["month", "apples", "bananas", "cherries", "dates"].slice(1);

  // List of groups = species here = value of the first column called group -> I show them on the X axis
  const groups = data.map(d => d.month).flatMap(c => c);
  console.log({ groups });

  // Add X axis
  const x = d3.scaleBand().domain(groups).range([0, width]).padding(0.2);
  svg.append("g").attr("transform", `translate(20, ${height})`).call(d3.axisBottom(x).tickSizeOuter(0));

  // Add Y axis
  const y = d3.scaleLinear().domain([0, 60]).range([height, 0]);
  svg.append("g").attr("transform", `translate(20, 0)`).call(d3.axisLeft(y));

  // color palette = one color per subgroup
  const color = d3.scaleOrdinal().domain(subgroups).range(["#FF8A33", "#F9E2D0", "#A7D841", "#388E3C"]);

  //stack the data? --> stack per subgroup
  const stackedData = d3.stack().keys(subgroups)(data);
  console.log(stackedData);
  // Show the bars
  svg
    .append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .join("g")
    .attr("fill", d => color(d.key))
    .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data(d => d)
    .join("rect")
    .attr("x", d => x(d.data.month))
    .attr("y", d => y(d[1]))
    .attr("height", d => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .attr("transform", `translate(20, 0)`);
}

export const PointsBarChart = () => {
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
