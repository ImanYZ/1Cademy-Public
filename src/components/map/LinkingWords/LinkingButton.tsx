import { Button, Tooltip } from "@mui/material";
import React, { useCallback } from "react";

// import HyperEditor from "../../../Editor/HyperEditor/HyperEditorWrapper";
import { NodeType } from "../../../types";
import NodeTypeIcon from "../../NodeTypeIcon2";
// import MetaButton from "../../MetaButton/MetaButton";

const doNothing = () => { };

type LinkingButtonProps = {
  onClick: any,
  // nodeID: any,
  linkedNodeID: any,
  linkedNodeTitle: string,
  linkedNodeType: "child" | "children" | "tag" | "parent" | "reference",
  nodeType?: NodeType,
  visible?: boolean,
  iClassName?: string,
}

const LinkingButton = (props: LinkingButtonProps) => {
  const linkedNodeClick = useCallback(
    (event) => props.onClick(props.linkedNodeID),
    [props.onClick, props.linkedNodeID]
  );

  let iClassName = "material-icons LinkingButtonIcon ";
  if (props.linkedNodeType !== "children") {
    if (props.visible) {
      iClassName += "green-text";
    } else {
      iClassName += "orange-text text-lighten-2";
    }
  } else {
    iClassName += "gray-text";
  }
  return (
    <Tooltip
      title={`${props.visible ? "Navigate to" : "Open"} ${props.linkedNodeType === "children"
        ? " all the children."
        : " this " + props.linkedNodeType + " node."
        }`}
      placement={
        props.linkedNodeType === "child" ||
          props.linkedNodeType === "children" ||
          props.linkedNodeType === "tag"
          ? "right"
          : "left"
      }
    >
      <Button onClick={linkedNodeClick}>


        {/* // <MetaButton
          //   onClick={linkedNodeClick}
          //   tooltip={`${props.visible ? "Navigate to" : "Open"} ${props.linkedNodeType === "children"
          //     ? " all the children."
          //     : " this " + props.linkedNodeType + " node."
          //     }`}
          //   tooltipPosition={
          //     props.linkedNodeType === "child" ||
          //       props.linkedNodeType === "children" ||
          //       props.linkedNodeType === "tag"
          //       ? "Right"
          //       : "Left"
          //   }
          // > */}
        <NodeTypeIcon nodeType={props.nodeType} tooltipPlacement={"top"} />
        {/* CHECK: I commented this, please uncomment this */}
        {/* <HyperEditor readOnly={true} onChange={doNothing} content={props.linkedNodeTitle} /> */}
        <p>{props.linkedNodeTitle}</p>

        {/* {props.nodeLoading == props.nodeID + "LinkTo" + props.linkedNodeID && (
        <div className="preloader-wrapper active small right">
          <div className="spinner-layer spinner-yellow-only">
            <div className="circle-clipper left">
              <div className="circle"></div>
            </div>
          </div>
        </div>
      )} */}
        {/* // </MetaButton> */}


      </Button>
    </Tooltip >
  );
};

export default React.memo(LinkingButton);
