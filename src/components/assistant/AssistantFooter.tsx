import EmailIcon from "@mui/icons-material/Email";
import GitHubIcon from "@mui/icons-material/GitHub";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { Box, IconButton, Link, Stack, SxProps, Theme, Tooltip, Typography } from "@mui/material";
import NextImage from "next/image";
import React from "react";

import logo1cademy from "../../../public/assistant/1Assistant.svg";
import { DividerStyled } from "../AppFooter";
import { ONE_ASSISTANT_SECTIONS } from "./sections";
type AppFooterProps = {
  sx?: SxProps<Theme>;
};
const color = "#EAECF0";
const AssistantFooter = ({ sx }: AppFooterProps) => {
  return (
    <Box
      component={"footer"}
      sx={{
        color,
        backgroundColor: "#000",
        p: "48px 16px",

        "& a": {
          whiteSpace: "nowrap",
          color,
          cursor: "pointer",
          fontWeight: 600,
        },
        ...sx,
      }}
    >
      <Box sx={{ maxWidth: "1280px", m: "auto", px: { xs: "16px", sm: "32px" } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2,1fr)",
              sm: "repeat(3,1fr)",
              md: "repeat(6,minmax(max-content,1fr))",
              justifyItems: "start",
              rowGap: "40px",
            },
          }}
        >
          <Box sx={{ gridColumn: { xs: "span 2", sm: "span 3" } }}>
            <Stack direction={"row"} flexWrap={"wrap"} alignItems={"center"} spacing={"12px"} sx={{ mb: "32px" }}>
              <NextImage src={logo1cademy} alt="logo 1cademy" width="40px" height="40px" />
              <Box component={"span"} sx={{ fontSize: "24px", fontWeight: 600 }}>
                1Assistant
              </Box>
            </Stack>
            <Typography color={color}>Helps you optimize your life</Typography>
          </Box>
          <Box></Box>
          <Box>
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color, mb: "16px" }}> Navigation</Typography>
            <Stack spacing={"12px"}>
              {ONE_ASSISTANT_SECTIONS.slice(1).map(cur => {
                return (
                  <Tooltip key={cur.id} title={cur.title} placement="right">
                    <Link href={`#${cur.id}`} sx={{ textDecoration: "none" }}>
                      {cur.label}
                    </Link>
                  </Tooltip>
                );
              })}
            </Stack>
          </Box>
          <Box>
            <Box gridColumn={"1 / span 2"} mb="16px">
              <Typography sx={{ fontSize: "14px", fontWeight: 600, color, mb: "16px" }}>Contact Us</Typography>

              <Stack direction={"row"} alignItems="center" spacing={"8px"}>
                <IconButton href="mailto:onecademy@umich.edu" aria-label="Mail us" sx={{ p: "0" }}>
                  <EmailIcon sx={{ color: "#98A2B3" }} fontSize="medium" />
                </IconButton>
                <Typography color={color} sx={{ textDecorationLine: "underline", fontWeight: 600 }}>
                  onecademy@umich.edu
                </Typography>
              </Stack>
            </Box>
            <Box gridColumn={"1 / span 2"}>
              <Typography sx={{ fontSize: "14px", fontWeight: 600, color, mb: "12px" }}> Follow Us</Typography>

              <IconButton
                rel="noreferrer"
                aria-label="Open Youtube channel"
                target="_blank"
                href="https://www.youtube.com/channel/UCKBqMjvnUrxOhfbH1F1VIdQ/"
                sx={{ p: "0" }}
              >
                <YouTubeIcon sx={{ color: "#98A2B3" }} fontSize="medium" />
              </IconButton>
            </Box>
          </Box>
        </Box>
        <br />
        <DividerStyled />
        <br />
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={"8px"}>
          <span style={{ fontSize: "14px" }}>&copy; 1Assistant {new Date().getFullYear()}</span>
          <Stack direction={"row"} spacing="16px">
            <GitHubIcon fontSize="medium" sx={{ color: "#98A2B3" }} />
            <Box>
              <Typography color="#D0D5DD" fontSize={"14px"} display={"inline-block"}>
                We're committed to OpenSource on
              </Typography>
              <Link
                href="https://github.com/ImanYZ/Assistant"
                target="_blank"
                rel="noreferrer"
                sx={{ textDecoration: "underline", ml: "4px" }}
              >
                Github
              </Link>
            </Box>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default AssistantFooter;
