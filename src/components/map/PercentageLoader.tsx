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
      <div className="cont" data-pct={props.percentage} style={{ width: props.widthInPx, height: props.heightInPx }}>
        <svg className="svg" width="200" height="200" viewport="0 0 100 100" version="1.1">
          <circle
            r={props.radius}
            cx="98.5"
            cy="96.1"
            fill="transparent"
            strokeDasharray="565.48"
            strokeDashoffset="0"
          ></circle>
          <circle
            className="bar"
            r={props.radius}
            cx="98.5"
            cy="96.1"
            fill="transparent"
            strokeDasharray="565.48"
            strokeDashoffset="0"
            style={{
              strokeDashoffset: ((109 - props.percentage) / 100) * Math.PI * (props.radius * 2),
            }}
          ></circle>
        </svg>
      </div>
    </>
  );
};

export default React.memo(PercentageLoader);
