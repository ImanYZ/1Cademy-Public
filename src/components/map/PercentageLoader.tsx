import { Box } from "@mui/material";
import React from "react";

// TODO: calculate dynamically
// strokeDasharray={Math.PI * Math.pow(size / 2, 2)}
const CIRCLE_DASH_ARRAY = 270;

type PercentageLoaderProps = {
  size: number;
  percentage: number;
  strokeWidth?: number;
};
const PercentageLoader = ({ size, strokeWidth = 4, ...props }: PercentageLoaderProps) => {
  return (
    <>
      <Box data-pct={props.percentage} sx={{ width: size, height: size, position: "absolute", bottom: "0px" }}>
        <svg className="svg" width={size} height={size} version="1.1">
          <circle
            r={(size - strokeWidth) / 2}
            cx={size / 2}
            cy={size / 2}
            fill="transparent"
            strokeDasharray={CIRCLE_DASH_ARRAY}
            strokeDashoffset="0"
            stroke="#666"
            strokeWidth={`${strokeWidth}px`}
          ></circle>
          <circle
            className="bar"
            r={(size - strokeWidth) / 2}
            cx={size / 2}
            cy={size / 2}
            fill="transparent"
            strokeDasharray={270}
            strokeDashoffset="0"
            stroke="#ff9f1e"
            strokeWidth={`${strokeWidth}px`}
            style={{ strokeDashoffset: ((100 - props.percentage) / 100) * CIRCLE_DASH_ARRAY }}
          ></circle>
        </svg>
      </Box>
      <Box
        style={{
          width: size,
          height: size,
          position: "absolute",
          bottom: "0px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          fontSize: "15px",
          textShadow: "0 0 .125em black",
        }}
      >
        {props.percentage} %
      </Box>
    </>
  );
};

export default React.memo(PercentageLoader);
