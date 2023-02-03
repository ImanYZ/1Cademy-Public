import EmailIcon from "@mui/icons-material/Email";
import GitHubIcon from "@mui/icons-material/GitHub";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { Box, Divider, IconButton, Link, Stack, SxProps, Theme, Tooltip, Typography } from "@mui/material";
import NextImage from "next/image";
import React from "react";

import logo1cademy from "../../public/1Cademy-head.svg";
import { ONE_CADEMY_SECTIONS } from "./home/SectionsItems";
type AppFooterProps = {
  sx?: SxProps<Theme>;
};
const color = "#EAECF0";
const AppFooter3 = ({ sx }: AppFooterProps) => {
  return (
    <Box
      component={"footer"}
      sx={{
        color,
        backgroundColor: "#0A0D14",
        p: "48px 16px",

        "& a": {
          whiteSpace: "nowrap",
          color,
          cursor: "pointer",
          textDecoration: "none",
          fontWeight: "bold",
        },
        ...sx,
      }}
    >
      <Box sx={{ maxWidth: "1216px", m: "auto" }}>
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
                1Cademy
              </Box>
            </Stack>
            <Typography color={color}> We Synthesize books & Research papers together</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color, mb: "16px" }}> Navigation</Typography>
            <Stack spacing={"12px"}>
              {ONE_CADEMY_SECTIONS.slice(1).map(cur => {
                return (
                  <Tooltip key={cur.id} title={cur.title}>
                    <Link href={`#${cur.id}`}>{cur.label}</Link>
                  </Tooltip>
                );
              })}
            </Stack>
          </Box>
          <Box>
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color, mb: "16px" }}> Other</Typography>
            <Stack spacing={"12px"}>
              <Link
                target="_blank"
                href="https://1cademy.us/terms"
                underline="none"
                sx={{ color: theme => theme.palette.grey[500] }}
              >
                Terms
              </Link>
              <Link
                target="_blank"
                href="https://1cademy.us/privacy"
                underline="none"
                sx={{ color: theme => theme.palette.grey[500] }}
              >
                Privacy
              </Link>
              <Link
                target="_blank"
                href="https://1cademy.us/cookie"
                underline="none"
                sx={{ color: theme => theme.palette.grey[500] }}
              >
                Cookie
              </Link>
            </Stack>
          </Box>
          <Box>
            <Box gridColumn={"1 / span 2"} mb="16px">
              <Typography sx={{ fontSize: "14px", fontWeight: 600, color, mb: "16px" }}>Contact Us</Typography>

              <Stack direction={"row"} alignItems="center">
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
        <Divider sx={{ color: "white", width: "100%" }} />
        <br />
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={"8px"}>
          <span style={{ fontSize: "14px" }}>&copy; 1Cademy {new Date().getFullYear()}</span>
          <Box>
            <GitHubIcon fontSize="medium" />
            <Typography color="#D0D5DD" fontSize={"14px"} display={"inline-block"}>
              We're committed to OpenSource on{" "}
            </Typography>
            <Link
              href="https://github.com/ImanYZ/1Cademy-Public/"
              target="_blank"
              rel="noreferrer"
              sx={{ textDecoration: "underline" }}
            >
              Github
            </Link>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default AppFooter3;
