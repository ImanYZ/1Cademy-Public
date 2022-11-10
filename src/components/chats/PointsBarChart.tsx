import * as d3 from "d3";
import React, { useCallback } from "react";
import { UserTheme } from "src/knowledgeTypes";
import { ISemesterStudent } from "src/types/ICourse";

import { StudenBarsSubgroupLocation, StudentStackedBarStatsObject } from "@/pages/instructors/dashboard";

import { SemesterStudentVoteStat, StackedBarStats } from "../../instructorsTypes";

// const columns = ["fruit", "vegetable"];
const LESS_EQUAL_THAN_10_COLOR = "rgb(255, 196, 153)";
const LESS_EQUAL_THAN_10_COLOR_ALPHA = "rgba(255, 196, 153, .75)";
const GREATER_THAN_10_COLOR = "rgb(249, 226, 208 )";
const GREATER_THAN_10_COLOR_ALPHA = "rgba(249, 226, 208, .75)";
const GREATER_THAN_50_COLOR = "rgb(167, 216, 65 )";
const GREATER_THAN_50_COLOR_ALPHA = "rgba(167, 216, 65, .75)";
const GREATER_THAN_100_COLOR = "rgb(56, 142, 60)";
const GREATER_THAN_100_COLOR_ALPHA = "rgba(56, 142, 60, .75)";

// var data1 = [
//   { index: 0, alessEqualTen: 12, bgreaterTen: 11, cgreaterFifty: 1, dgreaterHundred: 0 },
//   { index: 1, alessEqualTen: 7, bgreaterTen: 7, cgreaterFifty: 7, dgreaterHundred: 7 },
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

function drawChart(
  svgRef: SVGGElement,
  data: StackedBarStats[],
  maxAxisY: number,
  studentProposalsRate: StudentStackedBarStatsObject | null,
  studentQuestionsRate: StudentStackedBarStatsObject | null,
  theme: UserTheme,
  studentLocation?: StudenBarsSubgroupLocation
) {
  //   const data = [12, 5, 6, 6, 9, 10];
  //   const height = 120;
  //   const width = 250;
  const svg = d3.select(svgRef);

  // set the dimensions and margins of the graph
  const margin = { top: 30, right: 0, bottom: 30, left: 50 },
    width = 250 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  svg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // List of subgroups = header of the csv files = soil condition here
  const subgroups = ["index", "alessEqualTen", "bgreaterTen", "cgreaterFifty", "dgreaterHundred"].slice(1);

  // List of groups = species here = value of the first column called group -> I show them on the X axis
  // const groups = data.map(d => d.index).flatMap(c => c);
  // console.log({ groups });

  const columns = ["Proposals", "Questions"];

  // remove axis if exist to avoid overdrawing
  svg.select("#axis-x").remove();
  svg.select("#axis-y").remove();

  // Add X axis
  const x = d3.scaleBand().domain(columns).range([0, width]).padding(0.2);
  svg
    .append("g")
    .attr("id", "axis-x")
    .attr("transform", `translate(25, ${height + 30})`)
    .call(d3.axisBottom(x).tickSizeOuter(0));

  // Add Y axis
  const y = d3.scaleLinear().domain([0, maxAxisY]).range([height, 0]);
  svg.append("g").attr("id", "axis-y").attr("transform", `translate(25,30)`).call(d3.axisLeft(y));

  // color palette = one color per subgroup
  const colorApha = d3
    .scaleOrdinal()
    .domain(subgroups)
    .range([
      LESS_EQUAL_THAN_10_COLOR_ALPHA,
      GREATER_THAN_10_COLOR_ALPHA,
      GREATER_THAN_50_COLOR_ALPHA,
      GREATER_THAN_100_COLOR_ALPHA,
    ]);
  const color = d3
    .scaleOrdinal()
    .domain(subgroups)
    .range([LESS_EQUAL_THAN_10_COLOR, GREATER_THAN_10_COLOR, GREATER_THAN_50_COLOR, GREATER_THAN_100_COLOR]);

  const locations = [
    {
      x: 1.65 * x.bandwidth(),
      y: studentLocation ? studentLocation.proposals ?? 0 : 0,
    },
    {
      x: 2.9 * x.bandwidth(),
      y: studentLocation ? studentLocation.questions ?? 0 : 0,
    },
  ];

  const stackedData = d3.stack().keys(subgroups)(data);

  //tooltip
  const tooltip = d3.select("#boxplot-tool-tip");
  // .append("div");
  // .style("position", "absolute")
  // .style("opacity", 0)
  // .attr("class", "tooltip")
  // .style("background-color", "#303134")
  // .style("border-radius", "5px")

  // .style("padding", "10px");

  const htmlTooltip = (users: ISemesterStudent[]) => {
    const html = users.map(user => {
      return `<div class="tooltip-body ${theme === "Dark" ? "darkMode" : "lightMode"}">
      <img
        class="tooltip-user-image"
        src="${user.imageUrl}"
        onerror="this.error=null;this.src='https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png'"
        loading="lazy"
        />
      <span>
         ${user.fName}

         ${user.lName}
      </span></div>
      `;
    });
    const wrapper = `<div id="users-tooltip">
      ${html.join(" ")}
    </div>`;
    return wrapper;
  };

  const tooltipElement = document.getElementById("boxplot-tool-tip");
  let event: any = null;
  let subgropup: string = "";

  const retrieveEvent = (e: any, subgroupName: any) => {
    event = e;
    subgropup = subgroupName;
  };
  tooltipElement?.addEventListener("mouseenter", () => {
    if (!event || !event.target) return;

    tooltip.style("pointer-events", "auto");
    d3.select(`#${event.target.id}`)
      .transition()
      .style("fill", color(subgropup) as string);
  });
  tooltipElement?.addEventListener("mouseleave", () => {
    tooltip.style("pointer-events", "none").style("opacity", 0);
    if (!event || !event.target) return;

    d3.select(`#${event.target.id}`)
      .transition()
      .style("fill", colorApha(subgropup) as string);
  });

  window.addEventListener("click", () => {
    tooltip.style("pointer-events", "none").style("opacity", 0);
    if (!event || !event.target) return;

    d3.select(`#${event.target.id}`)
      .transition()
      .style("fill", colorApha(subgropup) as string);
  });
  svg
    .select("#bars")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .join("g")
    .attr("fill", d => colorApha(d.key) as string)
    .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data(d => d)
    .join("rect")
    .attr("id", d => `bar-subgropup-${d.data.index}-${d[0]}-${d[1]}`)
    .on("mouseover", function (e, d) {
      const _this = this as any;
      if (!_this || !_this.parentNode) return;
      const parentNode = _this.parentNode as any;
      const selectedNode = d3.select(parentNode) as any;
      const subgroupName = selectedNode.datum().key as keyof StudentStackedBarStatsObject;
      let html = "";
      if (d.data.index === 0) {
        // @ts-ignore
        html = htmlTooltip(studentProposalsRate[subgroupName]);
      } else {
        // @ts-ignore
        html = htmlTooltip(studentQuestionsRate[subgroupName]);
      }
      const middle = e.offsetY;
      d3.select(this)
        .transition()
        .style("fill", color(subgroupName) as string);
      tooltip
        .html(`${html}`)
        .style("pointer-events", "auto")
        .style("opacity", 1)
        .style("top", `${middle}px`)
        .style("left", `${d.data.index === 0 ? 1.7 * x.bandwidth() : 2.95 * x.bandwidth()}px`);
      retrieveEvent(e, subgroupName);
    })
    .on("mouseout", function (e) {
      const _this = this as any;
      if (!_this || !_this.parentNode) return;

      const parentNode = _this.parentNode as any;
      const selectedNode = d3.select(parentNode) as any;
      const subgroupName = selectedNode.datum().key;
      d3.select(this)
        .transition()
        .style("fill", colorApha(subgroupName) as string);
      retrieveEvent(e, subgroupName);
    })
    .attr("x", d => {
      const x1: number = d.data["index"];
      return x(columns[x1]) ?? 0;
    })
    .attr("y", d => y(d[1]))
    .attr("height", d => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .attr("transform", `translate(25, 30)`);

  const locationIconPath =
    "M7 9.5C6.33696 9.5 5.70107 9.23661 5.23223 8.76777C4.76339 8.29893 4.5 7.66304 4.5 7C4.5 6.33696 4.76339 5.70107 5.23223 5.23223C5.70107 4.76339 6.33696 4.5 7 4.5C7.66304 4.5 8.29893 4.76339 8.76777 5.23223C9.23661 5.70107 9.5 6.33696 9.5 7C9.5 7.3283 9.43534 7.65339 9.3097 7.95671C9.18406 8.26002 8.99991 8.53562 8.76777 8.76777C8.53562 8.99991 8.26002 9.18406 7.95671 9.3097C7.65339 9.43534 7.3283 9.5 7 9.5ZM7 0C5.14348 0 3.36301 0.737498 2.05025 2.05025C0.737498 3.36301 0 5.14348 0 7C0 12.25 7 20 7 20C7 20 14 12.25 14 7C14 5.14348 13.2625 3.36301 11.9497 2.05025C10.637 0.737498 8.85652 0 7 0Z";

  svg
    .select("#locations")
    .selectAll("path")
    .data(locations)
    .join("path")
    .attr("d", locationIconPath)
    .attr("transform", d => `translate(${d.x},${y(maxAxisY - d.y) + 10})`)
    .attr("fill", "#EF5350");
  svg
    .select("#location-line")
    .selectAll("rect")
    .data(locations)
    .join("rect")
    .attr("height", "1px")
    .attr("width", x.bandwidth() + 11)
    .attr("transform", d => `translate(${d.x - 1.05 * x.bandwidth()},${y(maxAxisY - d.y) + 30})`)
    .attr("fill", "#EF5350");
}
type StackedBarProps = {
  data: StackedBarStats[];
  proposalsStudents: StudentStackedBarStatsObject | null;
  questionsStudents: StudentStackedBarStatsObject | null;
  maxAxisY: number;
  studentVoteStat: SemesterStudentVoteStat | null;
  theme: UserTheme;
  studentLocation?: StudenBarsSubgroupLocation;
};
export const PointsBarChart = ({
  data,
  proposalsStudents,
  questionsStudents,
  maxAxisY,
  theme,
  studentLocation,
}: StackedBarProps) => {
  const svg = useCallback(
    (svgRef: any) => {
      drawChart(svgRef, data, maxAxisY, proposalsStudents, questionsStudents, theme, studentLocation);
    },
    [data, maxAxisY, proposalsStudents, questionsStudents, studentLocation, theme]
  );

  return (
    <div id="box-plot-container " style={{ position: "relative" }}>
      <svg ref={svg}>
        <text style={{ fontSize: "10px" }} fill={theme === "Dark" ? "white" : "black"} x={5} y={20}>
          # of Students
        </text>
        <g id="bars"></g>
        <path id="loc"></path>
        <g id="locations"></g>
        <g id="location-line"></g>
      </svg>

      <div id="boxplot-tool-tip" className={theme === "Light" ? "lightMode" : "darkMode"}></div>
    </div>
  );
};
