import { Button, Typography } from "@mui/material";
import { Box } from "@mui/system";
import NextImage from "next/image";
import React, { ReactNode } from "react";

type SidebarButtonsProps = {
  id: string;
  onClick: (e: any) => void;
  iconSrc: any;
  icon?: ReactNode;
  text: string;
  toolbarIsOpen: boolean;
  variant?: "fill" | "text";
  rightOption?: ReactNode;
};

export const SidebarButton = ({
  id,
  onClick,
  iconSrc,
  icon,
  text,
  toolbarIsOpen,
  variant = "text",
  rightOption = null,
}: SidebarButtonsProps) => {
  return (
    <Button
      id={id}
      onClick={onClick}
      sx={{
        minWidth: "52px",
        width: "100%",
        height: "40px",
        borderRadius: "16px",
        backgroundColor: variant === "fill" ? "#F38744" : undefined,
        lineHeight: "19px",
        display: "flex",
        p: "10px 16px",
        alignItems: "center",
        justifyContent: toolbarIsOpen ? "space-between" : "center",
        ":hover": {
          backgroundColor: theme =>
            variant === "fill"
              ? theme.palette.mode === "dark"
                ? "#F38744"
                : "#FF914E"
              : theme.palette.mode === "dark"
              ? "#55402B"
              : "#FFE2D0",
        },
      }}
    >
      <Box
        sx={{
          // border: "solid 1px royalBlue",
          display: "flex",
          alignItems: "center",
          fontSize: "19px",
        }}
      >
        {icon ? icon : <NextImage width={"22px"} src={iconSrc} alt="search icon" />}
        {toolbarIsOpen && (
          <Typography
            className="toolbarDescription"
            sx={{
              ml: "8px",
              textOverflow: "ellipsis",
              overflow: "hidden",
              maxWidth: "90px",
              whiteSpace: "nowrap",
              fontWeight: "500",
              fontSize: "15px",
              color: theme => (theme.palette.mode === "dark" ? "#EAECF0" : "#1D2939"),
            }}
          >
            {text}
          </Typography>
        )}
      </Box>
      {toolbarIsOpen && rightOption}
    </Button>
  );
};
