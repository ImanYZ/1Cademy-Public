import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import LockIcon from "@mui/icons-material/Lock";
import { Box, Button, Tooltip } from "@mui/material";
import React, { ReactNode, useCallback } from "react";

import { Editor } from "@/components/Editor";

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
  onClickOnDisable?: () => void;
  removed?: boolean;
  added?: boolean;
  proposalsSelected?: boolean;
};

const LinkingButton = ({ disabled = false, id, onClickOnDisable, ...props }: LinkingButtonProps) => {
  // TODO: check dependencies to remove eslint-disable-next-line
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const linkedNodeClick = useCallback(() => props.onClick(props.linkedNodeID), [props.onClick, props.linkedNodeID]);

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
      <LinkingButtonWrapper
        id={id}
        onClick={linkedNodeClick}
        onClickOnDisable={onClickOnDisable}
        disabled={disabled}
        removed={props?.removed}
        added={props?.added}
      >
        <Box sx={{ display: "flex", alignItems: "center", fontSize: "16px", justifyContent: "space-between" }}>
          {props.iClassName == "local_offer" ? (
            <LocalOfferIcon
              sx={{
                fontSize: "16px",
              }}
            />
          ) : props.iClassName == "locked_tag" ? (
            <LockIcon sx={{ height: "20px", width: "22px", color: "#ff8a33" }} />
          ) : (
            ""
          )}

          <NodeTypeIcon
            nodeType={props.nodeType}
            tooltipPlacement={"left"}
            sx={{
              fontSize: "16px",
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
            added={props?.added}
            proposalsSelected={props.removed || props.added}
          />
        </Box>
      </LinkingButtonWrapper>
    </Tooltip>
  );
};

type LinkingButtonWrapperProps = {
  id?: string;
  children: ReactNode;
  onClick: () => void;
  onClickOnDisable?: () => void;
  disabled?: boolean;
  removed?: boolean;
  added?: boolean;
};

const LinkingButtonWrapper = ({
  id,
  children,
  disabled = false,
  onClick,
  onClickOnDisable,
  removed,
  added,
}: LinkingButtonWrapperProps) => {
  if (disabled)
    return (
      <Box id={id} onClick={onClickOnDisable}>
        {children}
      </Box>
    );
  return (
    <Button
      id={id}
      onClick={onClick}
      sx={{
        justifyContent: "stretch",
        textAlign: "inherit",
        padding: "5px",
        textDecoration: removed ? "line-through" : "none",
        textDecorationColor: "black",
        color: added ? "darkgreen" : "",
        border: added ? "2px solid darkgreen" : removed ? "2px solid red" : "2px solid transparent",
        ":hover": {
          background: theme => (theme.palette.mode === "dark" ? "#404040" : "#D0D5DD"),
        },
      }}
    >
      {children}
    </Button>
  );
};

export default React.memo(LinkingButton);
