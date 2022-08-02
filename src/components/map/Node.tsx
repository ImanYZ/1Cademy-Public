import React, { useEffect, useRef } from "react";

import { NodeUser } from "../../knowledgeTypes";
import { NODE_WIDTH } from "../../lib/utils/Map.utils";
// import { NODE_WIDTH } from '../../lib/utils/constants'

type NodeProps = {
  nodeId: string;
  node: NodeUser;
  nodeChanged: (nodeRef: any, nodeId: string) => void;
};

const Node = ({ nodeId, node, nodeChanged }: NodeProps) => {
  const ref = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      nodeChanged(ref, nodeId);
    }, 700);
    // nodeChanged(ref, nodeId);
  }, [ref]);

  const { title, content, left, top } = node;
  // console.log("::", title, left, top);
  return (
    <div
      ref={ref}
      style={{
        width: NODE_WIDTH,
        left: left ? left : 1000,
        top: top ? top : 1000,
        position: "absolute",
        border: "solid 2px #fdc473",
        backgroundColor: "#1f1f1f",
        boxSizing: "border-box"
      }}
    >
      <h1>{title}</h1>
      <p>{content}</p>
    </div>
  );
};

export default Node;
