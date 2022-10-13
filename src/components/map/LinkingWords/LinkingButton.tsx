import { Box } from "@mui/material";
import React, { useCallback } from "react";

import { Editor } from "@/components/Editor";

import { NodeType } from "../../../types";
import NodeTypeIcon from "../../NodeTypeIcon2";
import { MemoizedMetaButton } from "../MetaButton";

const doNothing = () => {};

type LinkingButtonProps = {
  onClick: any;
  // nodeID: any,
  linkedNodeID: any;
  linkedNodeTitle: string;
  linkedNodeType: "child" | "children" | "tag" | "parent" | "reference";
  nodeType?: NodeType;
  visible?: boolean;
  iClassName?: string;
};

const LinkingButton = (props: LinkingButtonProps) => {
  // TODO: check dependencies to remove eslint-disable-next-line
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const linkedNodeClick = useCallback(() => props.onClick(props.linkedNodeID), [props.onClick, props.linkedNodeID]);

  // let iClassName = "material-icons LinkingButtonIcon ";
  // if (props.linkedNodeType !== "children") {
  //   if (props.visible) {
  //     iClassName += "green-text";
  //   } else {
  //     iClassName += "orange-text text-lighten-2";
  //   }
  // } else {
  //   iClassName += "gray-text";
  // }
  return (
    <MemoizedMetaButton
      onClick={linkedNodeClick}
      tooltip={`${props.visible ? "Navigate to" : "Open"} ${
        props.linkedNodeType === "children" ? " all the children." : " this " + props.linkedNodeType + " node."
      }`}
      tooltipPosition={
        props.linkedNodeType === "child" || props.linkedNodeType === "children" || props.linkedNodeType === "tag"
          ? "right"
          : "left"
      }
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <NodeTypeIcon
          nodeType={props.nodeType}
          tooltipPlacement={"left"}
          sx={{ fontSize: "16px", color: props.visible ? "#00E676" : "#f9a825", pr: "4px" }}
        />
        <Editor
          readOnly={true}
          setValue={doNothing}
          label={""}
          value={props.linkedNodeTitle}
          sxPreview={{ fontSize: "14px" }}
        />
        {/* CHECK: I commented this, please uncomment this */}
        {/* <HyperEditor readOnly={true} onChange={doNothing} content={props.linkedNodeTitle} /> */}
        {/* <HyperEditor
        readOnly={true}
        onChange={doNothing}
        content={props.linkedNodeTitle}
      /> */}
        {/* {props.nodeLoading == props.nodeID + "LinkTo" + props.linkedNodeID && (
        <div c<Editor readOnly={true} setValue={doNothing} label={""} value={props.linkedNodeTlassName="preloader-wrapper active small right">
          <div className="spinner-layer spinner-yellow-only">
            <div className="circle-clipper left">
              <div className="circle"></div>
            </div>
          </div>
        </div>
      )} */}
      </Box>
    </MemoizedMetaButton>
  );
};

export default React.memo(LinkingButton);
