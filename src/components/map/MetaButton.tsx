// import "./MetaButton.css";

import { Box, Tooltip, TooltipProps } from "@mui/material";
import React, { useCallback } from "react";

// import { useRecoilValue } from "recoil";
// import {
//   isSubmittingState,
// } from "../../../store/AuthAtoms";
/* module of prevent clicking onClick twice */
// import useClickPreventionOnDoubleClick from "./preventOnClickTwice";
// import { preventEventPropagation } from "../../../utils/eventHandlers";
import useClickPreventionOnDoubleClick from "../../hooks/preventOnClickTwice";

const doNothing = () => {};

type MetaButtonProps = {
  children: JSX.Element;
  tooltipPosition?: TooltipProps["placement"];
  tooltip?: string;
  onClick?: any;
  disabled?: boolean;
  onDoubleClick?: any;
  round?: boolean;
  style?: any;
};

const MetaButton = (props: MetaButtonProps) => {
  // const isSubmitting = useRecoilValue(isSubmittingState);

  /* This custom hook prevents user from double clicking onClick within 0.3s */
  const [handleClick, handleDoubleClick] = useClickPreventionOnDoubleClick(
    "onClick" in props && props.onClick ? props.onClick : doNothing,
    "onDoubleClick" in props && props.onDoubleClick ? props.onDoubleClick : doNothing
  );

  const metaButtonClick = useCallback(
    (event: any) => {
      event.persist();
      event.currentTarget.blur();
      event.stopPropagation();
      // if (!isSubmitting) {
      handleClick(event);
      // }
    },
    [handleClick]
  );

  if ("onClick" in props && props.onClick) {
    return (
      <Tooltip title={props.tooltip || ""} placement={props.tooltipPosition} disableInteractive>
        <button
          className={
            // (isSubmitting
            //   ? "disabled MetaButton waves-effect waves-light grey-text hoverable" :
            `MetaButton Clickable waves-effect waves-light grey-text hoverable ${props.disabled && "disabled"} ` +
            ("round" in props && props.round ? " Round" : "") +
            // )
            ("tooltip" in props && props.tooltip ? " Tooltip" : "")
          }
          disabled={props.disabled}
          // style={{ disabled: isSubmitting }}
          // disabled={isSubmitting}
          onClick={metaButtonClick}
          onDoubleClick={handleDoubleClick}
          style={props?.style}
        >
          {props.children}
          {/* {"tooltip" in props && props.tooltip && (
          <span
            className={"TooltipText " + (props.tooltipPosition ? props.tooltipPosition : "Bottom")}
            onClick={preventEventPropagation}
          >
            {props.tooltip}
          </span>
        )} */}
        </button>
      </Tooltip>
    );
  } else {
    return (
      <Tooltip title={props.tooltip ?? ""} placement={props.tooltipPosition || "bottom"}>
        <Box className="MetaButton">{props.children}</Box>
      </Tooltip>
      // <span className={"MetaButton" + ("tooltip" in props && props.tooltip ? " Tooltip" : "")}>
      //   {props.children}
      //   {"tooltip" in props && props.tooltip && (
      //     <span className={"TooltipText " + (props.tooltipPosition ? props.tooltipPosition : "Bottom")}>
      //       {props.tooltip}
      //     </span>
      //   )}
      // </span>
    );
  }
};

export const MemoizedMetaButton = React.memo(MetaButton);
