import { Button, Typography } from "@mui/material";
import { Box } from "@mui/system";
import NextImage from "next/image";
import React from "react";

type SidebarButtonsProps = {
  id: string;
  onClick: () => void;
  iconSrc: any;
  text: string;
  toolbarIsOpen: boolean;
  variant?: "fill" | "text";
};

export const SidebarButton = ({ id, onClick, iconSrc, text, toolbarIsOpen, variant = "text" }: SidebarButtonsProps) => {
  return (
    <Button
      id={id}
      onClick={onClick}
      //   disabled={disableSearchButton}
      sx={{
        // marginTop: "15px",
        // marginBottom: "4px",
        minWidth: "52px",
        width: "100%",
        height: "40px",
        borderRadius: "16px",
        backgroundColor: variant === "fill" ? "#F38744" : undefined,
        //   backgroundColor: theme =>
        //   disableSearchButton ? (theme.palette.mode === "dark" ? "#383838ff" : "#bdbdbdff") : "#F38744",
        // color: theme=>"white",
        lineHeight: "19px",
        display: "flex",
        // gap: isMenuOpen ? "6px" : "6px",
        p: "10px 16px",
        justifyContent: toolbarIsOpen ? "left" : "center",
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
        // ":hover": {
        //   backgroundColor: theme =>
        //     disableSearchButton
        //       ? theme.palette.mode === "dark"
        //         ? "#383838ff"
        //         : "#bdbdbdff"
        //       : theme.palette.mode === "dark"
        //       ? "#F38744"
        //       : "#FF914E",
        // },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          fontSize: "19px",
        }}
      >
        <NextImage width={"22px"} src={iconSrc} alt="search icon" />
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
              //   color: "#1D2939",
            }}
          >
            {text}
          </Typography>
        )}
      </Box>
    </Button>
  );
};
