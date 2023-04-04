import { Box, Button, Tooltip } from "@mui/material";
import NextImage from "next/image";
import React, { useCallback } from "react";

import { Editor } from "@/components/Editor";

import ReferenceYellowIcon from "../../../../public/reference-yellow.svg";
import TagYellowIcon from "../../../../public/tag-yellow.svg";
import { NodeType } from "../../../types";
import NodeTypeIcon from "../../NodeTypeIcon2";

const doNothing = () => {};

type LinkingButtonProps = {
  id?: string;
  onClick: any;
  // nodeID: any,
  linkedNodeID: any;
  linkedNodeTitle: string;
  linkedNodeType: "child" | "children" | "tag" | "parent" | "parents" | "reference";
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
    <Tooltip
      title={`${props.visible ? "Navigate to" : "Open"} ${
        props.linkedNodeType === "children" || props.linkedNodeType === "parent"
          ? ` all the ${props.linkedNodeType}.`
          : " this " + props.linkedNodeType + " node."
      }`}
      placement={
        props.linkedNodeType === "child" || props.linkedNodeType === "children" || props.linkedNodeType === "tag"
          ? "right"
          : "left"
      }
      disableInteractive
    >
      <Button
        id={id}
        onClick={linkedNodeClick}
        sx={{
          justifyContent: "stretch",
          textAlign: "inherit",
          padding: "5px",
          ":hover": {
            background: theme => (theme.palette.mode === "dark" ? "#404040" : "#D0D5DD"),
          },
        }}
        disabled={disabled}
      >
        <Box sx={{ display: "flex", alignItems: "center", fontSize: "16px", justifyContent: "space-between" }}>
          {props.iClassName == "local_offer" ? (
            <NextImage height={"20px"} width={"22px"} src={TagYellowIcon} alt="tag icon" />
          ) : props.iClassName == "menu_book" ? (
            <NextImage width={"22px"} src={ReferenceYellowIcon} alt="reference icon" />
          ) : (
            ""
          )}
          <NodeTypeIcon
            nodeType={props.nodeType}
            tooltipPlacement={"left"}
            fontSize={"inherit"}
            sx={{
              marginRight: "4px",
              color:
                props.linkedNodeType !== "children" && props.linkedNodeType !== "parents"
                  ? props.visible
                    ? "#00E676"
                    : "#f9a825"
                  : "gray",
            }}
          />
          <Editor
            readOnly={true}
            setValue={doNothing}
            label={""}
            value={props.linkedNodeTitle}
            disabled={disabled}
            sxPreview={{ fontSize: "14px", lineHeight: "1.5", marginLeft: "8px" }}
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
      </Button>
    </Tooltip>
  );
};

export default React.memo(LinkingButton);
