import { Button, Tooltip, useTheme } from "@mui/material";
import React from "react";

import { UserTheme } from "../../knowledgeTypes";

type ContainedButtonProps = {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  children: JSX.Element;
};

export const ContainedButton = ({ title, onClick, disabled = false, children }: ContainedButtonProps) => {
  const theme = useTheme();
  const getColorText = (isDisable: boolean, userTheme: UserTheme) => {
    if (isDisable) return "Dark" ? "dimgrey" : "rgba(0, 0, 0, 0.26)";
    return userTheme === "Dark" ? theme.palette.common.white : theme.palette.common.darkGrayBackground;
  };

  // const TooltipWrapper = disabled = ()

  return (
    <Tooltip title={title} placement={"bottom-start"}>
      {/* this span prevents Tooltip error when button is disable */}
      <span>
        <Button
          onClick={disabled ? undefined : onClick}
          disabled={disabled}
          variant="outlined"
          size="small"
          sx={{
            borderWidth: "0px",
            borderRadius: "52px",
            minWidth: "50px",
            background: theme => (theme.palette.mode === "dark" ? "#4f5154" : "#dbd9d9"),
            color: theme => getColorText(disabled, theme.palette.mode === "dark" ? "Dark" : "Light"),
            fill: theme => getColorText(disabled, theme.palette.mode === "dark" ? "Dark" : "Light"),
            cursor: disabled ? "none" : "cursor",
            ":hover": {
              borderWidth: "0px",
              background: theme => (theme.palette.mode === "dark" ? "#65696d" : "#b7b3b3"),
            },
          }}
        >
          {children}
        </Button>
      </span>
    </Tooltip>
  );
};
