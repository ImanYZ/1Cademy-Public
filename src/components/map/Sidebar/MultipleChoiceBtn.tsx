// import "./MultipleChoiceBtn.css";

import { Box, ListItem, ListItemButton, ListItemText, SxProps, Theme } from "@mui/material";
import React from "react";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { COMMUNITY_LEADERBOARD_TYPES } from "../CommunityLeaderboard/CommunityLeaderboard";

type MultipleChoiceBtnProps = {
  choices: { label: string; choose: any }[];
  onClose: any;
  comLeaderboardType: string;
  sx?: SxProps<Theme>;
};

const MultipleChoiceBtn = (props: MultipleChoiceBtnProps) => {
  return (
    <Box
      sx={{
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        left: "25px",
        bottom: "74px",
        width: "168px",
        borderRadius: "4px",
        background: theme => (theme.palette.mode === "dark" ? "#1B1A1A" : "#F9FAFB"),
        border: theme => (theme.palette.mode === "dark" ? "solid 1px #404040" : "solid 1px #D0D5DD"),
        boxShadow: theme =>
          theme.palette.mode === "dark"
            ? "0px 4px 4px rgba(0, 0, 0, 0.25), 0px 8px 8px -4px rgba(0, 0, 0, 0.03)"
            : "0px 4px 4px rgba(0, 0, 0, 0.25), 0px 8px 8px -4px rgba(0, 0, 0, 0.03)",
        ...props?.sx,
      }}
    >
      {props.choices.map(choice => {
        return (
          <ListItem key={choice.label} disablePadding sx={{ height: "30px", display: "flex" }} onClick={choice.choose}>
            <ListItemButton sx={{ p: "6px 10px" }}>
              <ListItemText
                primary={
                  <MarkdownRender
                    sx={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color:
                        COMMUNITY_LEADERBOARD_TYPES[props.comLeaderboardType] === choice.label ? "#FF8134" : "inherit",
                    }}
                    text={choice.label || ""}
                  />
                }
                disableTypography={true}
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </Box>
  );
};

export default React.memo(MultipleChoiceBtn);
