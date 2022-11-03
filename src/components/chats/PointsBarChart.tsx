import * as d3 from "d3";
import React, { useCallback } from "react";

// const columns = ["fruit", "vegetable"];

// var data = [
//   { month: new Date(2015, 0, 1), apples: 3840, bananas: 1920, cherries: 960, dates: 400 },
//   { month: new Date(2015, 1, 1), apples: 1600, bananas: 1440, cherries: 960, dates: 400 },
//   { month: new Date(2015, 2, 1), apples: 640, bananas: 960, cherries: 640, dates: 400 },
//   { month: new Date(2015, 3, 1), apples: 320, bananas: 480, cherries: 640, dates: 400 },
// ];
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
    width = 460 - margin.left - margin.right,
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

  console.log(1);
  // Parse the Data
  d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_stacked.csv").then(function (
    data
  ) {
    console.log(2);
    // List of subgroups = header of the csv files = soil condition here
    const subgroups = data.columns.slice(1);

    // List of groups = species here = value of the first column called group -> I show them on the X axis
    const groups = data.map(d => d.group).flatMap(c => c);
    console.log({ groups });

    // Add X axis
    const x = d3.scaleBand().domain(groups).range([0, width]).padding(0.2);
    svg.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(x).tickSizeOuter(0));

    // Add Y axis
    const y = d3.scaleLinear().domain([0, 60]).range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

    // color palette = one color per subgroup
    const color = d3.scaleOrdinal().domain(subgroups).range(["#e41a1c", "#377eb8", "#4daf4a"]);

    //stack the data? --> stack per subgroup
    const stackedData = d3.stack().keys(subgroups)(data);

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
      .attr("x", d => x(d.data.group))
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth());
  });
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
