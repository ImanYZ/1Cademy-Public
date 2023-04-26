import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import { Avatar, Box, Stack, Typography, useTheme } from "@mui/material";
import Image from "next/image";
import React from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import Logo1Cademy from "../../../../public/full-logo.svg";

export const DashboradToolbar = () => {
  const {
    palette: { mode },
  } = useTheme();

  return (
    <Box
      sx={{
        width: "200px",
        minHeight: "100%",
        p: "16px",
        bgcolor: mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG900 : DESIGN_SYSTEM_COLORS.gray25,
      }}
    >
      <Stack spacing={"16px"}>
        <Image src={Logo1Cademy.src} alt="1Logo" width={"100%"} height={"64px"} />
        <Stack
          direction={"row"}
          spacing={"6px"}
          p="6px"
          sx={{
            cursor: "pointer",
            background: theme => (theme.palette.mode === "dark" ? "#242425" : "#F2F4F7"),
            paddingY: "10px",
            paddingX: "5px",
            border: theme => (theme.palette.mode === "dark" ? "solid 1px #303134" : "solid 1px #D0D5DD"),
            borderRadius: "16px",
          }}
        >
          <Avatar />
          <Box>
            <Typography p="0">Carl Jhonson</Typography>
            <Typography
              sx={{
                fontSize: "12px",
                color: mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG200 : DESIGN_SYSTEM_COLORS.gray500,
              }}
            >
              Student
            </Typography>
          </Box>
        </Stack>
        <Stack>
          <Stack direction={"row"} sx={{ backgroundColor: DESIGN_SYSTEM_COLORS.notebookO900, borderRadius: "16px" }}>
            <HomeRoundedIcon />
            <Typography>Dashboard</Typography>
          </Stack>
          <Stack direction={"row"}></Stack>
        </Stack>
      </Stack>
    </Box>
  );
};
