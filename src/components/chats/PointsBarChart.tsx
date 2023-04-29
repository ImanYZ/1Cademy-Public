import * as d3 from "d3";
import React, { useCallback } from "react";
import { UserTheme } from "src/knowledgeTypes";
import { ISemesterStudent } from "src/types/ICourse";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { StudenBarsSubgroupLocation, StudentStackedBarStatsObject } from "@/pages/instructors/dashboard";

import { StackedBarStats } from "../../instructorsTypes";

// const columns = ["fruit", "vegetable"];
const LESS_EQUAL_THAN_10_COLOR = "#f4a869";
const LESS_EQUAL_THAN_10_COLOR_ALPHA = "#F7B27A";
const GREATER_THAN_10_COLOR = "#f8d198";
const GREATER_THAN_10_COLOR_ALPHA = "#F9DBAE";
const GREATER_THAN_50_COLOR = "#a4d734";
const GREATER_THAN_50_COLOR_ALPHA = "#A7D841";
const GREATER_THAN_100_COLOR = "#309135";
const GREATER_THAN_100_COLOR_ALPHA = "#388E3C";

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
  studentDailyPracticeRate: StudentStackedBarStatsObject | null,
  theme: UserTheme,
  studentLocation?: StudenBarsSubgroupLocation,
  mobile?: boolean,
  isQuestionRequired?: boolean,
  isProposalRequired?: boolean,
  isDailyPracticeRequiered?: boolean
) {
  //   const data = [12, 5, 6, 6, 9, 10];
  //   const height = 120;
  //   const width = 250;
  const svg = d3.select(svgRef);

  // set the dimensions and margins of the graph
  const margin = { top: 30, right: 0, bottom: 30, left: 50 },
    width = 325 - margin.left - margin.right,
    height = 340 - margin.top - margin.bottom;

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

  const columns: string[] = [];

  if (isProposalRequired) {
    columns.push("Proposals");
  }

  if (isQuestionRequired) {
    columns.push("Questions");
  }
  if (isDailyPracticeRequiered) {
    columns.push("Daily Practice");
  }
  // remove axis if exist to avoid overdrawing
  svg.select("#axis-x").remove();
  svg.select("#axis-y").remove();

  // Add X axis
  const x = d3.scaleBand().domain(columns).range([0, width]).paddingInner(0.27).paddingOuter(0.27);
  svg
    .append("g")
    .attr("id", "axis-x")
    .attr("transform", `translate(30, ${height + 30})`)
    .call(d3.axisBottom(x).tickSizeOuter(0).tickSize(0).tickPadding(8))
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .selectAll("path")
    .style("color", DESIGN_SYSTEM_COLORS.notebookG400);

  // Add Y axis
  const y = d3.scaleLinear().domain([0, maxAxisY]).range([height, 0]);
  const integerTickValues = d3.range(Math.ceil(y.domain()[0]), Math.floor(y.domain()[1]) + 1);
  svg
    .append("g")
    .attr("id", "axis-y")
    .attr("transform", `translate(30,30)`)
    .call(d3.axisLeft(y).tickSize(0).tickPadding(8).tickFormat(d3.format(".0f")).tickValues(integerTickValues))
    .style("font-size", "12px")
    .selectAll("path")
    .style("color", DESIGN_SYSTEM_COLORS.notebookG400);

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
      x: 1.55 * x.bandwidth(),
      y: studentLocation ? studentLocation.proposals ?? 0 : 0,
    },
    {
      x: 3.21 * x.bandwidth(),
      y: studentLocation ? studentLocation.questions ?? 0 : 0,
    },
    {
      x: 5.21 * x.bandwidth(),
      y: studentLocation ? studentLocation.totalDailyPractices ?? 0 : 0,
    },
  ];

  let chartData = [];
  if (isProposalRequired) {
    chartData.push(data[0] || []);
  }

  if (isQuestionRequired) {
    chartData.push(data[1] || []);
  }
  if (isDailyPracticeRequiered) {
    chartData.push(data[2] || []);
  }
  const stackedData = d3.stack().keys(subgroups)(chartData);

  //tooltip
  const tooltip = d3.select("#boxplot-tooltip");
  // .append("div");
  // .style("position", "absolute")
  // .style("opacity", 0)
  // .attr("class", "tooltip")
  // .style("background-color", "#303134")
  // .style("border-radius", "5px")

  // .style("padding", "10px");
  const htmlTooltip = (users: ISemesterStudent[]) => {
    console.log("STUDENTS", users);
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

  const tooltipElement = document.getElementById("boxplot-tooltip");
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
  tooltipElement?.addEventListener("touchstart", () => {
    console.log("touch");
    if (!event || !event.target) return;

    event.preventDefault();
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

  window.addEventListener("click", e => {
    e.preventDefault();
    if (!e || !e.target || !event || !event.target) return;
    //@ts-ignore
    if (!e.target.id.includes("bar-subgroup")) {
      tooltip.style("pointer-events", "none").style("opacity", 0);
      return;
    }
    tooltip.style("pointer-events", "auto").style("opacity", 1);
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
    .attr("id", d => `bar-subgroup-${d.data.index}-${d[0]}-${d[1]}`)
    .on("mouseover", function (e, d) {
      const _this = this as any;
      if (!_this || !_this.parentNode) return;
      const parentNode = _this.parentNode as any;
      const selectedNode = d3.select(parentNode) as any;
      const subgroupName = selectedNode.datum().key as keyof StudentStackedBarStatsObject;
      let html = "";
      if (d.data.index === 0 && studentProposalsRate) {
        // @ts-ignore
        html = htmlTooltip(studentProposalsRate[subgroupName]);
      } else if (studentQuestionsRate) {
        // @ts-ignore
        html = htmlTooltip(studentQuestionsRate[subgroupName]);
      } else if (studentDailyPracticeRate) {
        // @ts-ignore
        html = htmlTooltip(studentDailyPracticeRate[subgroupName]);
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
        .style(
          "left",
          `${d.data.index === 0 ? 1.6 * x.bandwidth() : mobile ? -x.bandwidth() / 2.5 : 3.25 * x.bandwidth()}px`
        );
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

    .attr("transform", `translate(30, 30)`);

  if (studentLocation) {
    const locationIconPath =
      "M8.54 20.351L8.61 20.391L8.638 20.407C8.74903 20.467 8.87327 20.4985 8.9995 20.4985C9.12573 20.4985 9.24997 20.467 9.361 20.407L9.389 20.392L9.46 20.351C9.85112 20.1191 10.2328 19.8716 10.604 19.609C11.5651 18.9305 12.463 18.1667 13.287 17.327C15.231 15.337 17.25 12.347 17.25 8.5C17.25 6.31196 16.3808 4.21354 14.8336 2.66637C13.2865 1.11919 11.188 0.25 9 0.25C6.81196 0.25 4.71354 1.11919 3.16637 2.66637C1.61919 4.21354 0.75 6.31196 0.75 8.5C0.75 12.346 2.77 15.337 4.713 17.327C5.53664 18.1667 6.43427 18.9304 7.395 19.609C7.76657 19.8716 8.14854 20.1191 8.54 20.351ZM9 11.5C9.79565 11.5 10.5587 11.1839 11.1213 10.6213C11.6839 10.0587 12 9.29565 12 8.5C12 7.70435 11.6839 6.94129 11.1213 6.37868C10.5587 5.81607 9.79565 5.5 9 5.5C8.20435 5.5 7.44129 5.81607 6.87868 6.37868C6.31607 6.94129 6 7.70435 6 8.5C6 9.29565 6.31607 10.0587 6.87868 10.6213C7.44129 11.1839 8.20435 11.5 9 11.5Z";

    svg
      .select("#locations")
      .selectAll("path")
      .data(locations)
      .join("path")
      .attr("d", locationIconPath)
      .attr("fill-rule", "evenodd")
      .attr("clip-rule", "evenodd")
      .attr(
        "transform",
        (d, i) =>
          `translate(${30 + (i + 1) * 0.369 * x.bandwidth() + (i + 1) * x.bandwidth() + 2},${y(maxAxisY - d.y) + 10})`
      )
      .attr("fill", "#C03938");
    svg
      .select("#location-line")
      .selectAll("rect")
      .data(locations)
      .join("rect")
      .attr("height", "1px")
      .attr("width", x.bandwidth() + 12)
      .attr(
        "transform",
        (d, i) => `translate(${30 + (i + 1) * 0.369 * x.bandwidth() + i * x.bandwidth()},${y(maxAxisY - d.y) + 30})`
      )
      .attr("fill", "#C03938");
    // d.x - 0.72 * x.bandwidth()
  }
}
type StackedBarProps = {
  data: StackedBarStats[];
  proposalsStudents: StudentStackedBarStatsObject | null;
  questionsStudents: StudentStackedBarStatsObject | null;
  dailyPracticeStudents: StudentStackedBarStatsObject | null;
  maxAxisY: number;
  theme: UserTheme;
  mobile?: boolean;
  studentLocation?: StudenBarsSubgroupLocation;
  isQuestionRequired?: boolean;
  isProposalRequired?: boolean;
  isDailyPracticeRequiered?: boolean;
};
export const PointsBarChart = ({
  data,
  proposalsStudents,
  questionsStudents,
  dailyPracticeStudents,
  maxAxisY,
  theme,
  studentLocation,
  mobile,
  isQuestionRequired,
  isProposalRequired,
  isDailyPracticeRequiered,
}: StackedBarProps) => {
  console.log({ newData: data });
  const svg = useCallback(
    (svgRef: any) => {
      drawChart(
        svgRef,
        data,
        maxAxisY,
        proposalsStudents,
        questionsStudents,
        dailyPracticeStudents,

        theme,
        studentLocation,
        mobile,
        isQuestionRequired,
        isProposalRequired,
        isDailyPracticeRequiered
      );
    },
    [
      data,
      maxAxisY,
      proposalsStudents,
      questionsStudents,
      dailyPracticeStudents,
      theme,
      studentLocation,
      mobile,
      isQuestionRequired,
      isProposalRequired,
      isDailyPracticeRequiered,
    ]
  );

  return (
    <div style={{ position: "relative" }}>
      <svg ref={svg}>
        {/* <text style={{ fontSize: "16px" }} fill={theme === "Dark" ? "white" : "black"} x={10} y={20}>
          # of Students
        </text> */}
        <g id="bars"></g>
        <path id="loc"></path>
        <g id="locations"></g>
        <g id="location-line"></g>
      </svg>

      <div id="boxplot-tooltip" className={`tooltip-plot ${theme === "Light" ? "lightMode" : "darkMode"}`}></div>
    </div>
  );
};
