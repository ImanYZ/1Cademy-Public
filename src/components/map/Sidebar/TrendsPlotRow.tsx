// import "./TrendsPlotRow.css";

import React, { ReactNode, useEffect, useState } from "react";
// import { useRecoilValue } from "recoil";
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

  useEffect(() => {
    if (props.trendData.length !== 0) {
      let oneThirdIndex = Math.floor(props.trendData.length / 3);
      let oneThirdValue = props.trendData[oneThirdIndex][props.x];
      let twoThirdIndex = Math.floor((props.trendData.length * 2) / 3);
      let twoThirdValue = props.trendData[twoThirdIndex][props.x];
      if (props.x === "date") {
        console.log({ oneThirdValue, twoThirdValue });
        oneThirdValue = new Date(oneThirdValue);
        twoThirdValue = new Date(twoThirdValue);
      }
      setZoomDomain({
        x: [twoThirdValue, oneThirdValue],
      });
    }
  }, [props.trendData, props.x]);

  return (
    <div className="TrendPlotRow">
      <div className="ChartTitle">{props.children}</div>
      <VictoryChart
        padding={{ top: 22, left: 70, right: 22, bottom: 70 }}
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
      >
        <VictoryAxis
          // scale={{ x: props.scaleX }}
          scale={props.scaleX}
          label={props.labelX}
          axisLabelComponent={<VictoryLabel dy={25} />}
          style={{
            tickLabels: {
              fontSize: 13,
              fill: props.theme === "Dark" ? "white" : "#454545",
            },
            axisLabel: {
              fill: props.theme === "Dark" ? "white" : "#454545",
            },
          }}
        />
        <VictoryAxis
          dependentAxis
          // scale={{ y: props.scaleY }}
          scale={props.scaleY}
          label={props.labelY}
          axisLabelComponent={<VictoryLabel dy={-40} />}
          style={{
            tickLabels: {
              fontSize: 13,
              fill: props.theme === "Dark" ? "white" : "#454545",
            },
            axisLabel: {
              fill: props.theme === "Dark" ? "white" : "#454545",
            },
          }}
        />
        <VictoryBar
          style={{
            data: { fill: "tomato" },
          }}
          data={props.trendData}
          x={props.x}
          y={props.y}
        />
      </VictoryChart>
      <VictoryChart
        padding={{ top: 10, left: 40, right: 22, bottom: 40 }}
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
              fill: props.theme === "Dark" ? "white" : "#454545",
              fillOpacity: 0.4,
            }}
            brushDomain={zoomDomain}
            onBrushDomainChange={setZoomDomain}
          />
        }
      >
        <VictoryAxis
          scale={props.scaleX}
          style={{
            tickLabels: {
              fontSize: 13,
              fill: props.theme === "Dark" ? "white" : "#454545",
            },
          }}
        />
        <VictoryBar
          style={{
            data: { fill: "tomato" },
          }}
          data={props.trendData}
          x={props.x}
          y={props.y}
        />
      </VictoryChart>
    </div>
  );
};

export default React.memo(TrendsPlotRow);
