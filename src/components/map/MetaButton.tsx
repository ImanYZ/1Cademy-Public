// import "./MetaButton.css";

import { Box, Button, Tooltip, TooltipProps } from "@mui/material";
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
  style?: { [key: string]: any };
  id?: string;
};

const MetaButton = ({
  children,
  tooltipPosition,
  tooltip,
  onClick,
  disabled,
  onDoubleClick,
  round,
  style,
  id,
}: MetaButtonProps) => {
  // const isSubmitting = useRecoilValue(isSubmittingState);

  /* This custom hook prevents user from double clicking onClick within 0.3s */
  const [handleClick, handleDoubleClick] = useClickPreventionOnDoubleClick(
    onClick ? onClick : doNothing,
    onDoubleClick ? onDoubleClick : doNothing
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

  if (onClick) {
    return (
      <Tooltip title={tooltip || ""} placement={tooltipPosition} disableInteractive>
        <span>
          <Button
            id={id}
            className={
              // (isSubmitting
              //   ? "disabled MetaButton waves-effect waves-light grey-text hoverable" :
              `MetaButton Clickable waves-effect waves-light grey-text hoverable ${disabled && "disabled"} ` +
              (round ? " Round" : "") +
              // )
              (tooltip ? " Tooltip" : "")
            }
            disabled={disabled}
            // style={{ disabled: isSubmitting }}
            // disabled={isSubmitting}
            onClick={metaButtonClick}
            onDoubleClick={handleDoubleClick}
            style={style}
          >
            {children}
            {/* {"tooltip" in props && tooltip && (
          <span
            className={"TooltipText " + (tooltipPosition ? tooltipPosition : "Bottom")}
            onClick={preventEventPropagation}
          >
            {tooltip}
          </span>
        )} */}
          </Button>
        </span>
      </Tooltip>
    );
  } else {
    return (
      <Tooltip title={tooltip ?? ""} placement={tooltipPosition || "bottom"}>
        <Box id={id} className="MetaButton">
          {children}
        </Box>
      </Tooltip>
      // <span className={"MetaButton" + ("tooltip" in props && tooltip ? " Tooltip" : "")}>
      //   {children}
      //   {"tooltip" in props && tooltip && (
      //     <span className={"TooltipText " + (tooltipPosition ? tooltipPosition : "Bottom")}>
      //       {tooltip}
      //     </span>
      //   )}
      // </span>
    );
  }
};

export const MemoizedMetaButton = React.memo(MetaButton);
