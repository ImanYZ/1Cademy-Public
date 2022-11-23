import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  ScaleName,
  VictoryAxis,
  VictoryBar,
  VictoryBrushContainer,
  VictoryChart,
  VictoryLabel,
  VictoryTheme,
  VictoryZoomContainer,
} from "victory";

import { UserTheme } from "../../knowledgeTypes";

type TrendPlotProps = {
  title: string;
  width: number;
  heightTop: number;
  heightBottom: number;
  scaleX: ScaleName;
  labelX: string;
  scaleY: ScaleName;
  labelY: string;
  theme: UserTheme;
  x: string;
  y: string;
  trendData: any[];
};

export const TrendPlot = ({
  title,
  width,
  heightTop,
  heightBottom,
  scaleX,
  labelX,
  scaleY,
  labelY,
  theme,
  x,
  y,
  trendData,
}: TrendPlotProps) => {
  const [zoomDomain, setZoomDomain] = useState({});

  useEffect(() => {
    if (trendData.length !== 0) {
      // console.log({ trendData });
      let oneThirdIndex = Math.floor(trendData.length / 3);
      // console.log(trendData[oneThirdIndex], trendData[oneThirdIndex][x]);
      let oneThirdValue = trendData[oneThirdIndex][x];
      let twoThirdIndex = Math.floor((trendData.length * 2) / 3);
      let twoThirdValue = trendData[twoThirdIndex][x];
      if (x === "date") {
        // console.log({ oneThirdValue, twoThirdValue });
        oneThirdValue = new Date(oneThirdValue);
        twoThirdValue = new Date(twoThirdValue);
        // console.log(1, { oneThirdValue, twoThirdValue });
      }
      if (oneThirdValue >= twoThirdValue) {
        setZoomDomain({
          // x: [twoThirdValue, oneThirdValue],
          x: [twoThirdValue, oneThirdValue], // this depend of sort type of data
        });
      } else {
        setZoomDomain({
          x: [oneThirdValue, twoThirdValue], // this depend of sort type of data
        });
      }
    }
  }, [trendData, x]);

  // console.log({ heightBottom, heightTop });
  return (
    <Box sx={{ width /* borderkj: "solid 2px pink" */ }}>
      <Typography sx={{ fontSize: "19px" }}>{title}</Typography>

      <Box sx={{ width, height: heightTop /* border: "solid 2px royalblue" */ }}>
        <VictoryChart
          // padding={{ top: 22, left: 36, right: 0, bottom: 70 }}
          padding={{ top: 10, left: 40, right: 22, bottom: 50 }}
          width={width}
          height={heightTop}
          theme={VictoryTheme.material}
          domainPadding={25}
          // scale={{ x: props.scaleX }}
          // scale={{props.scaleX}}
          scale={{ x: scaleX, y: "linear" }}
          containerComponent={
            <VictoryZoomContainer zoomDimension="x" zoomDomain={zoomDomain} onZoomDomainChange={setZoomDomain} />
          }
        >
          <VictoryAxis
            // scale={{ x: props.scaleX }}
            scale={scaleX}
            label={labelX}
            axisLabelComponent={<VictoryLabel dy={25} />}
            style={{
              tickLabels: {
                fontSize: 13,
                fill: theme === "Dark" ? "white" : "#454545",
              },
              axisLabel: {
                fill: theme === "Dark" ? "white" : "#454545",
              },
              grid: {
                stroke: theme === "Dark" ? "white" : "#454545",
              },
              ticks: { size: 0 },
            }}
          />
          <VictoryAxis
            dependentAxis
            // scale={{ y: props.scaleY }}
            scale={scaleY}
            label={labelY}
            axisLabelComponent={<VictoryLabel dy={-40} />}
            style={{
              tickLabels: {
                fontSize: 13,
                fill: theme === "Dark" ? "white" : "#454545",
              },
              axisLabel: {
                fill: theme === "Dark" ? "white" : "#454545",
              },
              grid: {
                stroke: theme === "Dark" ? "white" : "#454545",
              },
              ticks: { size: 1 },
            }}
          />
          <VictoryBar
            style={{
              data: { fill: "tomato" },
            }}
            data={trendData}
            x={x}
            y={y}
          />
        </VictoryChart>
      </Box>

      <Box sx={{ width, height: heightBottom /* border: "solid 2px royalblue" */ }}>
        <VictoryChart
          padding={{ top: 10, left: 40, right: 22, bottom: 40 }}
          width={width}
          height={heightBottom}
          theme={VictoryTheme.material}
          domainPadding={25}
          // scale={{ x: props.scaleX }}
          containerComponent={
            <VictoryBrushContainer
              brushDimension="x"
              brushStyle={{
                stroke: "transparent",
                fill: theme === "Dark" ? "white" : "#454545",
                fillOpacity: 0.4,
              }}
              brushDomain={zoomDomain}
              onBrushDomainChange={setZoomDomain}
            />
          }
        >
          <VictoryAxis
            scale={scaleX}
            style={{
              tickLabels: {
                fontSize: 13,
                fill: theme === "Dark" ? "white" : "#454545",
              },
              grid: {
                stroke: theme === "Dark" ? "white" : "#454545",
              },
            }}
          />
          <VictoryBar
            style={{
              data: { fill: "tomato" },
            }}
            data={trendData}
            x={x}
            y={y}
          />
        </VictoryChart>
      </Box>
    </Box>
  );
};
