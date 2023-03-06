import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { Box } from "@mui/material";
import React, { useCallback } from "react";

import { Editor } from "@/components/Editor";

import { NodeType } from "../../../types";
import NodeTypeIcon from "../../NodeTypeIcon2";
import { MemoizedMetaButton } from "../MetaButton";

const doNothing = () => {};

type LinkingButtonProps = {
  id?: string;
  onClick: any;
  // nodeID: any,
  linkedNodeID: any;
  linkedNodeTitle: string;
  linkedNodeType: "child" | "children" | "tag" | "parent" | "reference";
  nodeType?: NodeType;
  visible?: boolean;
  iClassName?: string;
  disabled?: boolean;
};

const LinkingButton = ({ disabled = false, id, ...props }: LinkingButtonProps) => {
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
      id={id}
      onClick={linkedNodeClick}
      tooltip={`${props.visible ? "Navigate to" : "Open"} ${
        props.linkedNodeType === "children" ? " all the children." : " this " + props.linkedNodeType + " node."
      }`}
      tooltipPosition={
        props.linkedNodeType === "child" || props.linkedNodeType === "children" || props.linkedNodeType === "tag"
          ? "right"
          : "left"
      }
      style={{ padding: "0px" }}
      disabled={disabled}
    >
      <Box sx={{ display: "flex", alignItems: "center", fontSize: "16px" }}>
        {props.iClassName == "local_offer" ? (
          <LocalOfferIcon
            sx={{
              marginRight: "4px",
              fontSize: "16px",
              color: props.linkedNodeType !== "children" ? (props.visible ? "#00E676" : "#f9a825") : "gray",
            }}
          />
        ) : props.iClassName == "menu_book" ? (
          <MenuBookIcon
            sx={{
              marginRight: "4px",
              fontSize: "16px",
              color: props.linkedNodeType !== "children" ? (props.visible ? "#00E676" : "#f9a825") : "gray",
            }}
          />
        ) : (
          ""
        )}
        <NodeTypeIcon
          nodeType={props.nodeType}
          tooltipPlacement={"left"}
          fontSize={"inherit"}
          sx={{
            marginRight: "4px",
            color: props.linkedNodeType !== "children" ? (props.visible ? "#00E676" : "#f9a825") : "gray",
          }}
        />
        <Editor
          readOnly={true}
          setValue={doNothing}
          label={""}
          value={props.linkedNodeTitle}
          disabled={disabled}
          sxPreview={{ fontSize: "14px", lineHeight: "1.5" }}
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
