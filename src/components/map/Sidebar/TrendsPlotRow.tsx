// import "./TrendsPlotRow.css";

import { Box } from "@mui/system";
import React, { ReactNode, useEffect, useRef, useState } from "react";
// import { useRecoilValue } from "recoil";
import {
  ScaleName,
  VictoryAxis,
  VictoryBar,
  VictoryBrushContainer,
  VictoryChart,
  VictoryTheme,
  VictoryZoomContainer,
} from "victory";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

// import { themeState } from "../../../../store/AuthAtoms";

type TrendsPlotRowProps = {
  children: ReactNode;
  theme: string;
  trendData: any[];
  x: string;
  y: string;
  scaleX: ScaleName;
  scaleY: ScaleName;
  labelX: string;
  labelY: string;
  width: number;
  heightTop: number;
  heightBottom: number;
};

const TrendsPlotRow = (props: TrendsPlotRowProps) => {
  // const theme = useRecoilValue(themeState);

  const [zoomDomain, setZoomDomain] = useState({});
  const chartRef = useRef<HTMLElement | null>(null);
  const legendChartRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!chartRef) return;
    if (!legendChartRef) return;

    const chartContainer = chartRef.current;
    const chartLegendContainer = legendChartRef.current;
    if (!chartContainer) return;
    if (!chartLegendContainer) return;

    const rect = chartContainer.querySelector("rect");
    const rectLegend = chartLegendContainer.querySelector("rect");

    if (!rect) return;
    if (!rectLegend) return;

    rect.setAttribute("rx", "10");
    rectLegend.setAttribute("rx", "10");
  }, []);

  useEffect(() => {
    if (props.trendData.length !== 0) {
      let oneThirdIndex = Math.floor(props.trendData.length / 3);
      let oneThirdValue = props.trendData[oneThirdIndex][props.x];
      let twoThirdIndex = Math.floor((props.trendData.length * 2) / 3);
      let twoThirdValue = props.trendData[twoThirdIndex][props.x];
      if (props.x === "date") {
        // console.log({ oneThirdValue, twoThirdValue });
        oneThirdValue = new Date(oneThirdValue);
        twoThirdValue = new Date(twoThirdValue);
      }
      setZoomDomain({
        x: [twoThirdValue, oneThirdValue],
      });
    }
  }, [props.trendData, props.x]);

  return (
    <Box className="TrendPlotRow">
      <Box ref={chartRef}>
        <VictoryChart
          padding={{ top: 0, left: 24, right: 4, bottom: 32 }}
          width={props.width}
          height={props.heightTop}
          theme={VictoryTheme.material}
          domainPadding={25}
          // scale={{ x: props.scaleX }}
          // scale={{props.scaleX}}
          scale={{ x: props.scaleX, y: "linear" }}
          containerComponent={
            <VictoryZoomContainer zoomDimension="x" zoomDomain={zoomDomain} onZoomDomainChange={setZoomDomain} />
          }
          style={{
            background: {
              fill: props.theme === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray200,
            },
          }}
        >
          <VictoryAxis
            // scale={{ x: props.scaleX }}
            scale={props.scaleX}
            style={{
              axis: { stroke: "transparent", size: 0 },
              ticks: { size: 0 },
              tickLabels: {
                fontSize: 12,
                fill: props.theme === "dark" ? DESIGN_SYSTEM_COLORS.gray50 : DESIGN_SYSTEM_COLORS.gray800,
              },

              grid: {
                stroke: props.theme === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.gray300,
                strokeDasharray: null,
              },
            }}
          />
          <VictoryAxis
            dependentAxis
            scale={props.scaleY}
            style={{
              axis: { stroke: "transparent" },
              tickLabels: {
                fontSize: 12,
                fill: props.theme === "dark" ? DESIGN_SYSTEM_COLORS.gray50 : DESIGN_SYSTEM_COLORS.gray800,
              },
              ticks: { size: 0 },
              grid: {
                stroke: props.theme === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.gray300,
                strokeDasharray: null,
              },
            }}
          />
          <VictoryBar
            barWidth={4}
            style={{
              data: { fill: DESIGN_SYSTEM_COLORS.primary600 },
            }}
            data={props.trendData}
            x={props.x}
            y={props.y}
          />
        </VictoryChart>
      </Box>
      <Box ref={legendChartRef}>
        <VictoryChart
          padding={{ top: 0, left: 24, right: 4, bottom: 32 }}
          width={props.width}
          height={props.heightBottom}
          theme={VictoryTheme.material}
          domainPadding={25}
          // scale={{ x: props.scaleX }}
          containerComponent={
            <VictoryBrushContainer
              brushDimension="x"
              brushStyle={{
                stroke: "transparent",
                fill: props.theme === "dark" ? "white" : "#454545",
                fillOpacity: 0.4,
              }}
              brushDomain={zoomDomain}
              onBrushDomainChange={setZoomDomain}
            />
          }
          style={{
            background: {
              fill: props.theme === "dark" ? DESIGN_SYSTEM_COLORS.notebookG700 : DESIGN_SYSTEM_COLORS.gray200,
            },
          }}
        >
          <VictoryAxis
            scale={props.scaleX}
            style={{
              axis: { stroke: "transparent" },
              tickLabels: {
                fontSize: 12,
                fill: props.theme === "dark" ? DESIGN_SYSTEM_COLORS.gray50 : DESIGN_SYSTEM_COLORS.gray800,
              },
              ticks: { size: 0 },
              grid: {
                stroke: props.theme === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.gray300,
                strokeDasharray: null,
              },
            }}
          />
          <VictoryBar
            barWidth={2}
            style={{
              data: { fill: DESIGN_SYSTEM_COLORS.primary600 },
            }}
            data={props.trendData}
            x={props.x}
            y={props.y}
          />
        </VictoryChart>
      </Box>
    </Box>
  );
};

export default React.memo(TrendsPlotRow);
