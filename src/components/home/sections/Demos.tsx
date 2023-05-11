import { Box, Link, Stack, Typography, useMediaQuery } from "@mui/material";
import NextImage from "next/image";
import React from "react";

import { DESIGN_SYSTEM_COLORS } from "../../../lib/theme/colors";
import { ellipsisString } from "../../../lib/utils/string.utils";
import OptimizedAvatar2 from "../../OptimizedAvatar2";

const ONE_CADEMY_CHANGE_NAME = "1Cademy";
const ONE_CADEMY_CHANEL_IMAGE = "/home/1cademy-youtube-channel.jpg";
const ONE_CADEMY_CHANEL_URL = "https://www.youtube.com/@1cademy530/videos";

type Demo = {
  id: string;
  // toolName: string;
  demoName: string;
  description: string;
  demoCreationDate: string;
  previewImage: string;
  url: string;
  chanelName: string;
  chanelImage: string;
  chanelUrl: string;
};

const DEMOS_ITEMS: Demo[] = [
  {
    id: "01",
    // toolName: "1Cademy Assistant",
    demoName: "Introducing 1Cademy Assistant - Practice Tool",
    description:
      "Ben Brown presents an introduction to 1Cademy Assistant practice tool and how it personalizes the daily practice and motivates students to improve their long-term learning.",
    demoCreationDate: "10 May 2023",
    previewImage: "/home/demos/practice-tool-demo.jpg",
    url: "https://www.youtube.com/watch?v=kU6ppO_WLC0",
    chanelName: ONE_CADEMY_CHANGE_NAME,
    chanelImage: ONE_CADEMY_CHANEL_IMAGE,
    chanelUrl: ONE_CADEMY_CHANEL_URL,
  },
  {
    id: "02",
    // toolName: "1Cademy Assistant",
    demoName: "Introducing 1Cademy Assistant - Question Answering",
    description: "Ben Brown presents the question-answering process using the 1Cademy Assistant.",
    demoCreationDate: "10 May 2023",
    previewImage: "/home/demos/question-answering-demo.jpg",
    url: "https://www.youtube.com/watch?v=Z8aVR459Kks",
    chanelName: ONE_CADEMY_CHANGE_NAME,
    chanelImage: ONE_CADEMY_CHANEL_IMAGE,
    chanelUrl: ONE_CADEMY_CHANEL_URL,
  },
];

export const Demos = () => {
  const displayMoreDescription = useMediaQuery("(min-width:600px) and (max-width:900px)");
  // console.log({ matches });

  return (
    <Box>
      <Typography component={"h3"} sx={{ fontSize: "20px", fontWeight: 600, mb: "32px" }}>
        Demos
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          columnGap: "32px",
          rowGap: { xs: "32px", md: "64px" },
          // border: "solid 2px royalBlue",
        }}
      >
        {DEMOS_ITEMS.map(cur => (
          <Box
            key={cur.id}
            sx={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0px,1fr)",
                // md: "minmax(80px, 180px) minmax(0px,1fr)",
                lg: "minmax(100px, 320px) minmax(0px,1fr)",
              },
              columnGap: { xs: "10px", lg: "24px" },
              // border: "solid 2px pink",
            }}
          >
            <Link href={cur.url} target="_blank" rel="noopener">
              <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <NextImage src={cur.previewImage} width="320px" height="200px" alt="Preview image of demo"></NextImage>
              </Box>
            </Link>
            <Box width={"100%"}>
              <Link href={cur.url} target="_blank" rel="noopener" sx={{ textDecoration: "none" }}>
                <Typography
                  sx={{
                    mb: "8px",
                    fontWeight: 600,
                    fontSize: "18px",
                    color: theme =>
                      theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray25 : DESIGN_SYSTEM_COLORS.gray900,
                  }}
                >
                  {cur.demoName}
                </Typography>
              </Link>
              <Typography
                sx={{
                  mb: "16px",
                  fontWeight: 400,
                  fontSize: "16px",
                  color: theme =>
                    theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray300 : DESIGN_SYSTEM_COLORS.gray600,
                }}
              >
                {displayMoreDescription ? ellipsisString(cur.description, 120) : ellipsisString(cur.description, 45)}
              </Typography>
              <Stack direction={"row"} spacing={"12px"}>
                <Link href={cur.chanelUrl} target="_blank" rel="noopener" sx={{ textDecoration: "none" }}>
                  <OptimizedAvatar2 size={40} imageUrl={cur.chanelImage} alt="youtube chanel icon" />
                </Link>
                <Box>
                  <Link href={cur.chanelUrl} target="_blank" rel="noopener" sx={{ textDecoration: "none" }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: "14px",
                        color: theme =>
                          theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray25 : DESIGN_SYSTEM_COLORS.gray900,
                      }}
                    >
                      {cur.chanelName}
                    </Typography>
                  </Link>
                  <Typography
                    sx={{
                      fontWeight: 400,
                      fontSize: "14px",
                      color: theme =>
                        theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray300 : DESIGN_SYSTEM_COLORS.gray600,
                    }}
                  >
                    {cur.demoCreationDate}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
