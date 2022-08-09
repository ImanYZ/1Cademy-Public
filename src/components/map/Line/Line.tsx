// import "./Line.css";

import { Box } from "@mui/material";
import React from "react";

import { Point } from "../../../knowledgeTypes";

type LineProps = {
  from: Point;
  to: Point;
  label?: string;
  leftDirection?: boolean;
  color: string;
};

const Line = (props: LineProps) => {
  // console.log('props',props)

  let from = props.from;
  let to = props.to;
  if (!props.leftDirection && to.x < from.x) {
    from = props.to;
    to = props.from;
  }

  const len = Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
  const angle = Math.atan((to.y - from.y) / (to.x - from.x));

  const style = {
    transform: `translate(${from.x - 0.5 * len * (1 - Math.cos(angle))}px,
                          ${from.y + 0.5 * len * Math.sin(angle)}px)
                          rotate(${angle}rad)`,
    width: `${len}px`
    // borderBottom:
    //   props.borderBottomStyle + " " + props.color || "1px solid black",
  };
  const rightArrowStyle: any = {
    borderLeft: `10px solid ${props.color}`
  };

  if (props.leftDirection) {
    rightArrowStyle.float = "left";
    rightArrowStyle.marginRight = 0;
    rightArrowStyle.marginLeft = "-1px";
    rightArrowStyle.borderLeft = "0px";
    rightArrowStyle.borderRight = `10px solid ${props.color}`;
  }

  return (
    <Box
      style={{
        ...style,
        position: "absolute",
        textAlign: "center",
        height: "0px",
        borderBottom: "2.5px solid rgb(1, 211, 106)"
      }}
    >
      <div className="RightArrow" style={rightArrowStyle}></div>
      <div className="Line">
        {props.label}
        {/* <Draft
          onChange={doNothing}
          node_id={props.identifier}
          content={label}
          stylable={false}
        /> */}
      </div>
    </Box>
  );
};

export default React.memo(Line);
