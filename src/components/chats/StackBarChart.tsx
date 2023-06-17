import * as d3 from "d3";
import React, { useCallback } from "react";
import { UserTheme } from "src/knowledgeTypes";
import { ISemesterStudent } from "src/types/ICourse";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { StackedBarStats } from "../../instructorsTypes";
import {
  StudentBarsSubgroupLocation as StudentBarsSubgroupLocation,
  StudentStackBarThresholds,
  StudentStackedBarStatsObject,
} from "../../lib/utils/charts.utils";
import { STACK_BAR_CHART_THRESHOLDS } from "../map/dashboard/Dashboard";

// const columns = ["fruit", "vegetable"];

//MOCK
// const mockedData = [
//   { index: 0, alessEqualTen: 10, bgreaterTen: 5, cgreaterFifty: 6, dgreaterHundred: 3 },
//   { index: 1, alessEqualTen: 8, bgreaterTen: 9, cgreaterFifty: 2, dgreaterHundred: 5 },
//   { index: 2, alessEqualTen: 2, bgreaterTen: 10, cgreaterFifty: 9, dgreaterHundred: 3 },
// ];

function drawChart(
  svgRef: SVGGElement,
  data: StackedBarStats[],
  maxAxisY: number,
  studentProposalsRate: StudentStackedBarStatsObject | null,
  studentQuestionsRate: StudentStackedBarStatsObject | null,
  studentDailyPracticeRate: StudentStackedBarStatsObject | null,
  theme: UserTheme,
  studentLocation?: StudentBarsSubgroupLocation,
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
  const subgroups = ["threshold1", "threshold2", "threshold3", "threshold4", "threshold5", "threshold6"];

  // List of groups = species here = value of the first column called group -> I show them on the X axis
  // const groups = data.map(d => d.index).flatMap(c => c);
  // console.log({ groups });

  const columns: string[] = [];

  columns.push("Proposals");
  if (isProposalRequired) {
  }

  columns.push("Questions");
  if (isQuestionRequired) {
  }
  columns.push("Daily Practice");
  if (isDailyPracticeRequiered) {
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
  const colorAlpha = d3
    .scaleOrdinal()
    .domain(subgroups)
    .range(["#EF6820", "#575757", "#F7B27A", "#FAC515", "#A7D841", "#388E3C"]);
  const color = d3
    .scaleOrdinal()
    .domain(subgroups)
    .range(["#ef6820e0", "#575757e0", "#F7B27Ae0", "#FAC515e0", "#A7D841e0", "#388E3Ce0"]);

  let locations = [
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
  // locations = locations.filter(location => location.y !== 0);
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
  console.log({ subgroups, chartData });
  const stackedData = d3.stack().keys(subgroups)(chartData);
  console.log({ stackedData });

  //tooltip
  const tooltip = d3.select("#boxplot-tooltip");
  // .append("div");
  // .style("position", "absolute")
  // .style("opacity", 0)
  // .attr("class", "tooltip")
  // .style("background-color", "#303134")
  // .style("border-radius", "5px")

  // .style("padding", "10px");

  const tooltipElement = document.getElementById("boxplot-tooltip");
  let event: any = null;
  let subgroup: string = "";

  const retrieveEvent = (e: any, subgroupName: any) => {
    event = e;
    subgroup = subgroupName;
  };
  tooltipElement?.addEventListener("mouseenter", () => {
    if (!event || !event.target) return;

    tooltip.style("pointer-events", "auto");
    d3.select(`#${event.target.id}`)
      .transition()
      .style("fill", color(subgroup) as string);
  });
  tooltipElement?.addEventListener("touchstart", () => {
    console.log("touch");
    if (!event || !event.target) return;

    event.preventDefault();
    tooltip.style("pointer-events", "auto");
    d3.select(`#${event.target.id}`)
      .transition()
      .style("fill", color(subgroup) as string);
  });
  tooltipElement?.addEventListener("mouseleave", () => {
    tooltip.style("pointer-events", "none").style("opacity", 0);
    if (!event || !event.target) return;

    d3.select(`#${event.target.id}`)
      .transition()
      .style("fill", colorAlpha(subgroup) as string);
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
      .style("fill", colorAlpha(subgroup) as string);
  });

  svg
    .select("#bars")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .join("g")
    .attr("fill", d => colorAlpha(d.key) as string)
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
        html = htmlTooltip(studentProposalsRate[subgroupName], subgroupName, theme);
      }
      if (d.data.index === 1 && studentQuestionsRate) {
        html = htmlTooltip(studentQuestionsRate[subgroupName], subgroupName, theme);
      }
      if (d.data.index === 2 && studentDailyPracticeRate) {
        html = htmlTooltip(studentDailyPracticeRate[subgroupName], subgroupName, theme);
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
          `${
            !mobile
              ? //offsetLeft = 50 , bars innergap = 0.369 , half of location icon = 2
                50 + (d.data.index + 1) * 0.369 * x.bandwidth() + (d.data.index + 1) * x.bandwidth() + 2
              : //offsetLeft = 30 , bars innergap = 0.369 , half of location icon = 2, half of tooltip width=90
                30 +
                (d.data.index + 1) * 0.369 * x.bandwidth() +
                (d.data.index + 1) * x.bandwidth() +
                2 -
                90 -
                x.bandwidth() / 2
          }px`
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
        .style("fill", colorAlpha(subgroupName) as string);
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
        (d, i) => `translate(${30 + (i + 1) * 0.369 * x.bandwidth() + (i + 1) * x.bandwidth() + 2},${y(d.y) + 10})`
      )
      .attr("fill", d => (d.y !== 0 ? "#C03938" : "transparent"));
    svg
      .select("#location-line")
      .selectAll("rect")
      .data(locations)
      .join("rect")
      .attr("height", "1px")
      .attr("width", x.bandwidth() + 12)
      .attr(
        "transform",
        (d, i) => `translate(${30 + (i + 1) * 0.369 * x.bandwidth() + i * x.bandwidth()},${y(d.y) + 30})`
      )
      .attr("fill", d => (d.y !== 0 ? "#C03938" : "transparent"));
  }
}
type StackBarProps = {
  data: StackedBarStats[];
  proposalsStudents: StudentStackedBarStatsObject | null;
  questionsStudents: StudentStackedBarStatsObject | null;
  dailyPracticeStudents: StudentStackedBarStatsObject | null;
  maxAxisY: number;
  theme: UserTheme;
  mobile?: boolean;
  studentLocation?: StudentBarsSubgroupLocation;
  isQuestionRequired?: boolean;
  isProposalRequired?: boolean;
  isDailyPracticeRequired?: boolean;
};
export const StackBarChart = ({
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
  isDailyPracticeRequired: isDailyPracticeRequired,
}: StackBarProps) => {
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
        isDailyPracticeRequired
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
      isDailyPracticeRequired,
    ]
  );

  return (
    <div style={{ position: "relative" }}>
      <svg ref={svg}>
        <g id="bars"></g>
        <path id="loc"></path>
        <g id="locations"></g>
        <g id="location-line"></g>
      </svg>

      <div id="boxplot-tooltip" className={`tooltip-plot ${theme === "Light" ? "lightMode" : "darkMode"}`}></div>
    </div>
  );
};

const htmlTooltip = (users: ISemesterStudent[], subgroupName: StudentStackBarThresholds, theme: "Dark" | "Light") => {
  let borderColor = "transparent";
  if (subgroupName === "threshold1") borderColor = STACK_BAR_CHART_THRESHOLDS[0].color;
  if (subgroupName === "threshold2") borderColor = STACK_BAR_CHART_THRESHOLDS[1].color;
  if (subgroupName === "threshold3") borderColor = STACK_BAR_CHART_THRESHOLDS[2].color;
  if (subgroupName === "threshold4") borderColor = STACK_BAR_CHART_THRESHOLDS[3].color;
  if (subgroupName === "threshold5") borderColor = STACK_BAR_CHART_THRESHOLDS[4].color;
  if (subgroupName === "threshold6") borderColor = STACK_BAR_CHART_THRESHOLDS[5].color;
  const html = users.map(user => {
    return `<div class="students-tooltip-body ${theme === "Dark" ? "darkMode" : "lightMode"}">
      <img
        class="tooltip-student-image"
        src="${user.imageUrl}"
        onerror="this.error=null;this.src='https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png'"
        loading="lazy"
        />
      <span>${user.fName} ${user.lName}</span>
    </div>
    `;
  });
  const wrapper = `<div class="students-tooltip scroll-styled" style="border: solid 2px ${borderColor};border-radius:8px">
    ${html.join(" ")}
  </div>
  <div style="
           width: 0;
           height: 0;
           left: -12px;
           top: 14px;
           position: absolute;
           border-top: 12px solid transparent;
           border-bottom: 12px solid transparent;
           border-right: solid 12px ${borderColor}
           "
      ></div>
  `;
  return wrapper;
};
