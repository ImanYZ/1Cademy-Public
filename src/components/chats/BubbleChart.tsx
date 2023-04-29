import * as d3 from "d3";
import React, { useCallback } from "react";
import { UserRole, UserTheme } from "src/knowledgeTypes";
import { ISemesterStudent } from "src/types/ICourse";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { BubbleStats, SemesterStudentVoteStat } from "../../instructorsTypes";

// import { BubbleStats } from "@/pages/instructors/dashboard";

// const columns = ["fruit", "vegetable"];

const RED = "#E04F16";
const GRAY = "#575757";
const LESS_EQUAL_THAN_10_COLOR = "#F7B27A";
const GREATER_THAN_10_COLOR = "#F9DBAF";
const GREATER_THAN_50_COLOR = "#A7D841";
const GREATER_THAN_100_COLOR = "#388E3C";

// const data = [
//   { students: 30, votes: 170, points: 40 },
//   { students: 70, votes: 150, points: 19 },
//   { students: 70, votes: 350, points: 79 },
//   { students: 30, votes: 270, points: 18 },
//   { students: 25, votes: 330, points: 20 },
//   { students: 35, votes: 120, points: 60 },
//   { students: 20, votes: 340, points: -10 },
//   { students: 10, votes: 140, points: 80 },
//   { students: 30, votes: 110, points: 0 },
//   { students: 15, votes: 370, points: -2 },
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
type BubbleMargin = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

function drawChart(
  svgRef: SVGGElement,
  data: BubbleStats[],
  width: number,
  height: number,
  margin: BubbleMargin,
  theme: UserTheme,
  maxAxisX: number,
  maxAxisY: number,
  minAxisX: number,
  minAxisY: number,
  student?: SemesterStudentVoteStat | null,
  role?: UserRole
) {
  const htmlTooltip = (users: ISemesterStudent[]) => {
    const html = users.map(user => {
      return `<div class="students-tooltip-body ${theme === "Dark" ? "darkMode" : "lightMode"}">
      <img
        class="tooltip-student-image"
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
    const wrapper = `<div class="students-tooltip">
      ${html.join(" ")}
    </div>`;
    return wrapper;
  };
  const tooltip = d3.select("#bubble-tool-tip");
  //   const data = [12, 5, 6, 6, 9, 10];
  //   const height = 120;
  //   const width = 250;
  const svg = d3.select(svgRef);
  // set the dimensions and margins of the graph
  // const margin = { top: 10, right: 0, bottom: 20, left: 50 },
  //   width = 500 - margin.left - margin.right,\
  const widthProcessed = width - margin.left - margin.right;
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
    .attr("width", width)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // List of subgroups = header of the csv files = soil condition here
  // const subgroups = ["month", "apples", "bananas", "cherries", "dates"].slice(1);

  // List of groups = species here = value of the first column called group -> I show them on the X axis
  // const groups = data.map(d => d.month).flatMap(c => c);

  // remove axis if exists
  svg.select("#axis-x").remove();
  svg.select("#axis-y").remove();
  // Add X axis
  const x = d3.scaleLinear().domain([minAxisX, maxAxisX]).range([0, widthProcessed]);
  svg
    .append("g")
    .attr("id", "axis-x")
    .attr("transform", `translate(30, ${height + 30})`)
    .call(d3.axisBottom(x).tickSizeOuter(0).tickSize(-height).tickPadding(8))
    .style("font-size", "12px")
    .selectAll("line")
    .style("color", DESIGN_SYSTEM_COLORS.notebookG400)
    .lower();

  // Add Y axis
  const y = d3
    .scaleLinear()
    .domain([minAxisY, maxAxisY + 10])
    .range([height, 0]);
  svg
    .append("g")
    .attr("id", "axis-y")
    .attr("transform", `translate(30, 30)`)
    .call(d3.axisLeft(y).tickSize(-width).tickPadding(8))
    .style("font-size", "12px")
    .selectAll("line")
    .attr("stroke", DESIGN_SYSTEM_COLORS.notebookG400)
    .lower();

  svg
    .select("#background")
    .attr("width", width)
    .attr("height", height)
    .attr("transform", `translate(30, 30)`)
    .attr("r", "8px")
    .lower();

  svg.selectAll("path").attr("stroke", DESIGN_SYSTEM_COLORS.notebookG500).lower();

  svg.selectAll("line").attr("stroke", DESIGN_SYSTEM_COLORS.notebookG500).lower();
  // svg.append("g").attr("class", "grid").call(d3.axisLeft(y).tickSize(-width));

  // color palette = one color per subgroup
  // const color = d3.scaleLinear().domain([]).range(["#FF8A33", "#F9E2D0", "#A7D841", "#388E3C"]);

  // @ts-ignore
  const color = d3
    .scaleThreshold()
    .domain([0, maxAxisY / 10, maxAxisY / 2, maxAxisY]) // @ts-ignore
    .range([RED, LESS_EQUAL_THAN_10_COLOR, GREATER_THAN_10_COLOR, GREATER_THAN_50_COLOR, GREATER_THAN_100_COLOR]);

  svg
    .select("#bubbles")
    .selectAll("circle")

    // Enter in the stack data = loop key per key = group per group
    .data(data)

    // .join("g")
    .join("circle")
    .attr("fill", d => (d.points !== 0 ? color(d.points) : GRAY))
    // .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    // .data(d => d)
    .attr("cx", d => x(d.votes))
    .attr("cy", d => y(d.points))

    .attr("r", 7.5)
    .attr("stroke-width", 2)
    .attr("stroke", d => (d.points !== 0 ? color(d.points) : GRAY))
    .attr("transform", `translate(30, 30)`)
    .on("mouseover", function (e, d) {
      const _this = this as any;
      if (!_this || !_this.parentNode) return;
      if (role === "INSTRUCTOR") {
        let html = htmlTooltip(d.studentsList);
        tooltip
          .html(`${html}`)
          .style("opacity", 1)
          .style("top", `${e.offsetY + 20}px`)
          .style("left", `${x(d.votes) - 50}px`);
      }

      d3.select(this)
        .transition()
        .style("fill", d.points !== 0 ? color(d.points) : GRAY);
    })
    .on("mouseout", function (e, d) {
      const _this = this as any;
      if (!_this || !_this.parentNode) return;
      tooltip.style("opacity", 0).style("pointer-events", "none");
      d3.select(this)
        .transition()
        .style("fill", d.points !== 0 ? color(d.points) : GRAY);
    });

  if (student) {
    const locationIconPath =
      "M8.54 20.351L8.61 20.391L8.638 20.407C8.74903 20.467 8.87327 20.4985 8.9995 20.4985C9.12573 20.4985 9.24997 20.467 9.361 20.407L9.389 20.392L9.46 20.351C9.85112 20.1191 10.2328 19.8716 10.604 19.609C11.5651 18.9305 12.463 18.1667 13.287 17.327C15.231 15.337 17.25 12.347 17.25 8.5C17.25 6.31196 16.3808 4.21354 14.8336 2.66637C13.2865 1.11919 11.188 0.25 9 0.25C6.81196 0.25 4.71354 1.11919 3.16637 2.66637C1.61919 4.21354 0.75 6.31196 0.75 8.5C0.75 12.346 2.77 15.337 4.713 17.327C5.53664 18.1667 6.43427 18.9304 7.395 19.609C7.76657 19.8716 8.14854 20.1191 8.54 20.351ZM9 11.5C9.79565 11.5 10.5587 11.1839 11.1213 10.6213C11.6839 10.0587 12 9.29565 12 8.5C12 7.70435 11.6839 6.94129 11.1213 6.37868C10.5587 5.81607 9.79565 5.5 9 5.5C8.20435 5.5 7.44129 5.81607 6.87868 6.37868C6.31607 6.94129 6 7.70435 6 8.5C6 9.29565 6.31607 10.0587 6.87868 10.6213C7.44129 11.1839 8.20435 11.5 9 11.5Z";

    svg
      .select("#location")
      .selectAll("path")
      .attr("d", locationIconPath)
      .attr("fill-rule", "evenodd")
      .attr("clip-rule", "evenodd")
      .attr("transform", `translate(${x(student.votes!) + 21},${y(student.votePoints!)})`) //-23 and -24 because of right plot tranlation
      .attr("fill", "#EF5350");
  }
  // svg
  //   .select("#nums")
  //   .selectAll("text")
  //   // Enter in the stack data = loop key per key = group per group
  //   .data(data)
  //   .join("text")
  //   .attr("fill", d => (d.points !== 0 ? borderColor(d.points) : GRAY))
  //   .attr("x", d => x(d.votes))
  //   .attr("y", d => y(d.points))
  //   .attr("text-anchor", "middle")
  //   .attr("alignment-baseline", "central")
  //   .text(d => d.students)
  //   .style("font-size", "24px")
  //   .attr("transform", `translate(30, 5)`);

  // d => (d.points !== 0 ? borderColor(d.points) : GRAY)
  // .append("text")            // append text
  // .style("fill", "black")      // make the text black
  // .style("writing-mode", "tb") // set the writing mode
  // .attr("x", 200)         // set x position of left side of text
  // .attr("y", 100)         // set y position of bottom of text
  // .text("Hello World");   // define the text to display
}

type BubblePlotProps = {
  data: BubbleStats[];
  width: number;
  margin: BubbleMargin;
  theme: UserTheme;
  maxAxisX: number;
  maxAxisY: number;
  minAxisX: number;
  minAxisY: number;
  student?: SemesterStudentVoteStat | null;
  role?: UserRole;
};
export const BubbleChart = ({
  width,
  margin,
  theme,
  data,
  maxAxisX,
  maxAxisY,
  minAxisX,
  minAxisY,
  student,
  role,
}: BubblePlotProps) => {
  const height = 400;
  const svg = useCallback(
    (svgRef: any) => {
      drawChart(svgRef, data, width, height, margin, theme, maxAxisX, maxAxisY, minAxisX, minAxisY, student, role);
    },
    [data, margin, maxAxisX, maxAxisY, minAxisX, minAxisY, role, student, theme, width]
  );

  return (
    <div style={{ position: "relative" }}>
      <svg ref={svg} style={{ position: "relative" }}>
        <g id="bubbles"></g>
        <g id="nums"></g>
        <g id="location">
          <path></path>
        </g>
        <rect id="background" fill={`${DESIGN_SYSTEM_COLORS.notebookG700}`}></rect>
        <text style={{ fontSize: "12px" }} fill={theme === "Dark" ? "white" : "black"} x={0} y={20}>
          Vote Points
        </text>
        <text style={{ fontSize: "12px" }} fill={theme === "Dark" ? "white" : "black"} x={width - 100} y={height}>
          Nº of Votes
        </text>
      </svg>
      <div id="bubble-tool-tip" className={`tooltip-plot ${theme === "Light" ? "lightMode" : "darkMode"}`}></div>
    </div>
  );
};
