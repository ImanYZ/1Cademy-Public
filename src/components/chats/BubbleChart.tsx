import * as d3 from "d3";
import React, { useCallback } from "react";
import { UserRole, UserTheme } from "src/knowledgeTypes";
import { ISemesterStudent } from "src/types/ICourse";

import { BubbleStats, SemesterStudentVoteStat } from "../../instructorsTypes";

// import { BubbleStats } from "@/pages/instructors/dashboard";

// const columns = ["fruit", "vegetable"];

// const GREEN = "rgb(56, 142, 60)";
// const GREEN_ALPHA = "rgba(129, 199, 132, 0.5)";
const RED = "rgb(239, 83, 80)";
const RED_ALPHA = "rgba(239, 83, 80, 0.5)";
const GRAY = "rgb(117, 117, 117)";
const GRAY_ALPHA = "rgba(237, 237, 237, 0.5)";
// const ORANGE = "rgb(255, 138, 51)";
// const ORANGE_ALPHA = "rgba(251, 204, 169, 0.5)";

const LESS_EQUAL_THAN_10_COLOR = "rgb(255, 196, 153)";
const LESS_EQUAL_THAN_10_COLOR_ALPHA = "rgba(255, 196, 153, .75)";
const GREATER_THAN_10_COLOR = "rgb(249, 226, 208 )";
const GREATER_THAN_10_COLOR_ALPHA = "rgba(249, 226, 208, .75)";
const GREATER_THAN_50_COLOR = "rgb(167, 216, 65 )";
const GREATER_THAN_50_COLOR_ALPHA = "rgba(167, 216, 65, .75)";
const GREATER_THAN_100_COLOR = "rgb(56, 142, 60)";
const GREATER_THAN_100_COLOR_ALPHA = "rgba(56, 142, 60, .75)";

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
    .attr("transform", `translate(30, ${height + 5})`)
    .call(d3.axisBottom(x).tickSizeOuter(0));

  // Add Y axis
  const y = d3
    .scaleLinear()
    .domain([minAxisY, maxAxisY + 10])
    .range([height, 0]);
  svg.append("g").attr("id", "axis-y").attr("transform", `translate(30, 5)`).call(d3.axisLeft(y));

  // color palette = one color per subgroup
  // const color = d3.scaleLinear().domain([]).range(["#FF8A33", "#F9E2D0", "#A7D841", "#388E3C"]);

  // @ts-ignore
  const color = d3
    .scaleThreshold()
    .domain([0, maxAxisY / 10, maxAxisY / 2, maxAxisY]) // @ts-ignore
    .range([
      RED_ALPHA,
      LESS_EQUAL_THAN_10_COLOR_ALPHA,
      GREATER_THAN_10_COLOR_ALPHA,
      GREATER_THAN_50_COLOR_ALPHA,
      GREATER_THAN_100_COLOR_ALPHA,
    ]);
  // @ts-ignore
  const borderColor = d3
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
    .attr("fill", d => (d.points !== 0 ? color(d.points) : GRAY_ALPHA))
    // .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    // .data(d => d)
    .attr("cx", d => x(d.votes))
    .attr("cy", d => y(d.points))
    // .attr("height", d => y(d[0]) - y(d[1]))
    .attr("r", 10)
    .attr("stroke-width", 2)
    .attr("stroke", d => (d.points !== 0 ? borderColor(d.points) : GRAY))
    .attr("transform", `translate(30, 5)`)
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
        .style("fill", d.points !== 0 ? borderColor(d.points) : GRAY);
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
      "M7 9.5C6.33696 9.5 5.70107 9.23661 5.23223 8.76777C4.76339 8.29893 4.5 7.66304 4.5 7C4.5 6.33696 4.76339 5.70107 5.23223 5.23223C5.70107 4.76339 6.33696 4.5 7 4.5C7.66304 4.5 8.29893 4.76339 8.76777 5.23223C9.23661 5.70107 9.5 6.33696 9.5 7C9.5 7.3283 9.43534 7.65339 9.3097 7.95671C9.18406 8.26002 8.99991 8.53562 8.76777 8.76777C8.53562 8.99991 8.26002 9.18406 7.95671 9.3097C7.65339 9.43534 7.3283 9.5 7 9.5ZM7 0C5.14348 0 3.36301 0.737498 2.05025 2.05025C0.737498 3.36301 0 5.14348 0 7C0 12.25 7 20 7 20C7 20 14 12.25 14 7C14 5.14348 13.2625 3.36301 11.9497 2.05025C10.637 0.737498 8.85652 0 7 0Z";

    svg
      .select("#location")
      .selectAll("path")
      .attr("d", locationIconPath)
      .attr("transform", `translate(${x(student.votes) + 23},${y(student.votePoints) - 24})`) //-23 and -24 because of right plot tranlation
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

        <text style={{ fontSize: "19px" }} fill={theme === "Dark" ? "white" : "black"} x={width - 100} y={height}>
          # of Votes
        </text>
      </svg>
      <div id="bubble-tool-tip" className={`tooltip-plot ${theme === "Light" ? "lightMode" : "darkMode"}`}></div>
    </div>
  );
};
