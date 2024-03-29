import { Button, Tooltip, TooltipProps, useTheme } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import React from "react";

import { UserTheme } from "../../knowledgeTypes";

type ContainedButtonProps = {
  id?: string;
  title: string;
  tooltipPosition?: TooltipProps["placement"];
  onClick: any;
  disabled?: boolean;
  children: JSX.Element;
  sx?: SxProps<Theme>;
};

export const ContainedButton = ({
  id,
  title,
  onClick,
  disabled = false,
  children,
  tooltipPosition = "bottom-start",
  sx,
}: ContainedButtonProps) => {
  const theme = useTheme();
  const getColorText = (isDisable: boolean, userTheme: UserTheme) => {
    if (isDisable) return "Dark" ? "dimgrey" : "rgba(0, 0, 0, 0.26)";
    return userTheme === "Dark" ? theme.palette.common.white : theme.palette.common.darkGrayBackground;
  };

  // const TooltipWrapper = disabled = ()

  return (
    <Tooltip title={title} placement={tooltipPosition}>
      {/* this span prevents Tooltip error when button is disable */}
      <span>
        <Button
          id={id}
          onClick={disabled ? undefined : onClick}
          variant="outlined"
          size="small"
          sx={{
            borderWidth: "0px",
            borderRadius: "52px",
            minWidth: "50px",
            background: theme => (theme.palette.mode === "dark" ? "#4f5154" : "#dbd9d9"),
            color: theme => getColorText(disabled, theme.palette.mode === "dark" ? "Dark" : "Light"),
            fill: theme => getColorText(disabled, theme.palette.mode === "dark" ? "Dark" : "Light"),
            cursor: disabled ? "auto" : "cursor",
            ":hover": {
              borderWidth: "0px",
              background: theme => (theme.palette.mode === "dark" ? "#65696d" : "#b7b3b3"),
            },
            ...sx,
          }}
        >
          {children}
        </Button>
      </span>
    </Tooltip>
  );
};
