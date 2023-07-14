// import "./Line.css";

import { Box } from "@mui/material";
import React, { useEffect } from "react";

import { onForceRecalculateGraphInput } from "@/pages/notebook";

import { Point } from "../../../knowledgeTypes";

type LineProps = {
  id: string;
  from: Point;
  to: Point;
  label?: string;
  leftDirection?: boolean;
  color: string;
  onForceRecalculateGraph: (props: onForceRecalculateGraphInput) => void;
};

const Line = ({ id, onForceRecalculateGraph, ...props }: LineProps) => {
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
    width: `${len}px`,
    // borderBottom:
    //   props.borderBottomStyle + " " + props.color || "1px solid black",
  };
  const rightArrowStyle: any = {
    borderLeft: `10px solid ${props.color}`,
  };

  /**
   * when edge is added or removed, the graph is force to recalculate
   */
  useEffect(() => {
    onForceRecalculateGraph({ id, by: "add-edge" }); // edge is added
    return () => onForceRecalculateGraph({ id, by: "remove-edge" }); // edge is removed
  }, [id, onForceRecalculateGraph]);

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
        borderBottom: "2.5px solid rgb(1, 211, 106)",
        transition: "0.5s",
      }}
    >
      <div className="RightArrow" style={rightArrowStyle}></div>
      <div className="Line">{props.label}</div>
    </Box>
  );
};

export default React.memo(Line);
