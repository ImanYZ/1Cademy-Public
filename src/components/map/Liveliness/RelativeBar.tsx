import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowUp";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import React from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { UserInteractionData } from "./LivelinessBar";
import { UserBubble } from "./UserBubble";

type RelativeBarProps = {
  numberOfUsersNoVisibleAbove: number;
  numberOfUsersNoVisibleBellow: number;
  userActionsToDisplay: (UserInteractionData | null)[];
  onlineUsers: string[];
  onToggleDisplay: () => void;
  openUserInfoSidebar: () => void;
  open: boolean;
  id?: string;
};

export const RelativeBar = ({
  numberOfUsersNoVisibleAbove,
  numberOfUsersNoVisibleBellow,
  userActionsToDisplay,
  onlineUsers,
  onToggleDisplay,
  openUserInfoSidebar,
  open,
  id,
}: RelativeBarProps) => {
  return (
    <Box
      id={id}
      sx={{
        top: "100px",
        bottom: "100px",
        right: "0px",
        zIndex: 998,
        position: "absolute",
        width: "56px",
        background: theme =>
          theme.palette.mode === "dark" ? theme.palette.common.darkBackground : theme.palette.common.lightBackground,
        borderRadius: "10px 0px 0px 10px",
        transform: !open ? "translate(calc(100%), 0px)" : null,
        transition: "all 0.2s 0s ease",
      }}
    >
      {/* bubble users bar */}
      <Box className="seekbar" sx={{ height: "100%", position: "relative" }}>
        <Stack
          id="liveliness-seekbar"
          justifyContent={"space-between"}
          alignItems={"center"}
          sx={{
            width: "100%",
            height: "100%",
          }}
        >
          {/* number of no visible users above */}
          <Typography>+{numberOfUsersNoVisibleAbove}</Typography>
          <Stack justifyContent={"space-between"} sx={{ height: "100%", transition: "0.2s", position: "relative" }}>
            <KeyboardArrowDownIcon
              sx={{
                fontSize: "20px",
                position: "absolute",
                left: "50%",
                top: "-8px",
                transform: "translateX(-50%)",
                color: theme => (theme.palette.mode === "dark" ? "#bebebe" : "rgba(0, 0, 0, 0.6)"),
              }}
            />
            {/* background line */}
            <Box
              sx={{
                position: "absolute",
                left: "50%",
                top: "0px",
                borderLeft: theme =>
                  theme.palette.mode === "dark" ? "2px solid #bebebe" : "1px solid rgba(0, 0, 0, 0.6)",
                bottom: "0px",
                transform: "translateX(-1px)",
              }}
            />

            {/* userAboveUsersLogged */}
            {userActionsToDisplay.map((cur, idx) =>
              cur ? (
                <UserBubble
                  key={cur.uname}
                  displayEmails={false}
                  isOnline={onlineUsers.includes(cur.uname)}
                  openUserInfoSidebar={openUserInfoSidebar}
                  userInteraction={cur}
                  size={28}
                />
              ) : (
                <Box key={idx} sx={{ width: "28px", height: "28px" }} />
              )
            )}
          </Stack>
          {/* number of no visible users bellow */}
          <Typography>+{numberOfUsersNoVisibleBellow}</Typography>
        </Stack>
      </Box>

      {/* toggle button */}
      <Tooltip title={open ? "Hide relative reputation liveness bar" : "Display relative reputation liveness bar"}>
        <IconButton
          sx={{
            background: theme =>
              theme.palette.mode === "dark"
                ? theme.palette.common.darkBackground
                : theme.palette.common.lightBackground,
            display: "flex",
            top: "50%",
            transform: "translate(0px, -50%)",
            left: "-22px",
            width: "28px",
            height: "36px",
            color: theme => (theme.palette.mode === "dark" ? "#bebebe" : "rgba(0, 0, 0, 0.6)"),
            position: "absolute",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            borderRadius: "6px 0px 0px 6px",
            cursor: "pointer",
            ":hover": {
              background: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG500 : DESIGN_SYSTEM_COLORS.notebookG50,
            },
          }}
          onClick={onToggleDisplay}
        >
          <ArrowForwardIosIcon
            fontSize="inherit"
            sx={{
              transform: !open ? "scaleX(-1)" : null,
            }}
          />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
