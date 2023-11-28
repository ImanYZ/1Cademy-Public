import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import NextImage from "next/image";
import React from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import TagIcon from "../../../../../../public/tag.svg";
type NewsCardProps = {
  heading: string;
  tag: string;
  image?: string;
  text: string;
};
export const NewsCard = ({ tag, image, heading, text }: NewsCardProps) => {
  return (
    <Box
      sx={{
        p: "0px 12px 12px 12px",
        mb: "40px",
        background: theme =>
          theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray200,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "end" }}>
        <Typography
          sx={{
            color: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG200 : DESIGN_SYSTEM_COLORS.gray500,
            position: "relative",
            bottom: "25px",
            left: "11px",
          }}
        >
          2:00 pm
        </Typography>
      </Box>
      {image && (
        <NextImage width={"500px"} height={"300px"} style={{ borderRadius: "8px" }} src={image} alt="news image" />
      )}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
        <Typography
          sx={{
            fontSize: "16px",
            fontWeight: "500",
            lineHeight: "24px",
          }}
        >
          {heading}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <NextImage width={"20px"} src={TagIcon} alt="tag icon" />
          <Box
            sx={{
              fontSize: "12px",
              marginLeft: "5px",
              color: theme =>
                theme.palette.mode === "dark" ? theme.palette.common.notebookG200 : theme.palette.common.gray500,
            }}
          >
            {tag}
          </Box>
        </Box>
      </Box>
      <Typography
        sx={{
          marginTop: "10px",
          fontSize: "14px",
          fontWeight: "400",
          lineHeight: "18px",
          textAlign: "justify",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};
