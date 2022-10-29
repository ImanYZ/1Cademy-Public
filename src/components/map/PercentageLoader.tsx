import { Box } from "@mui/material";
import React from "react";

type PercentageLoaderProps = {
  percentage: number;
  widthInPx: string;
  heightInPx: string;
  radius: number;
};
const PercentageLoader = (props: PercentageLoaderProps) => {
  return (
    <>
      <div
        className="cont"
        data-pct={props.percentage}
        style={{ width: props.widthInPx, height: props.heightInPx, position: "absolute", bottom: "0px" }}
      >
        <svg className="svg" width="170px" height="170px" version="1.1">
          <circle
            r={props.radius}
            cx="80"
            cy="85"
            fill="transparent"
            strokeDasharray="565.48"
            strokeDashoffset="0"
          ></circle>
          <circle
            className="bar"
            r={props.radius}
            cx="80"
            cy="85"
            fill="transparent"
            strokeDasharray="565.48"
            strokeDashoffset="0"
            style={{
              strokeDashoffset: ((109 - props.percentage) / 100) * Math.PI * (props.radius * 2),
            }}
          ></circle>
        </svg>
      </div>
      <Box
        style={{
          width: props.widthInPx,
          height: props.heightInPx,
          position: "absolute",
          bottom: "0px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          fontSize: "32px",
          textShadow: "0 0 .125em black",
        }}
        className="cont"
      >
        {props.percentage} %
      </Box>
    </>
  );
};

export default React.memo(PercentageLoader);
