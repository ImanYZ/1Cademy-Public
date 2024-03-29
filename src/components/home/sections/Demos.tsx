import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { Box, Modal, Typography } from "@mui/material";
import React, { useState } from "react";

import { DESIGN_SYSTEM_COLORS } from "../../../lib/theme/colors";

type Demo = {
  id: string;
  url: string;
  demoName: string;
  previewImage: string;
};

const DEMOS_ITEMS: Demo[] = [
  {
    id: "01",
    demoName: "1Cademy Assistant - Question Answering",
    url: "https://www.youtube.com/embed/Z8aVR459Kks",
    previewImage: "/home/demos/question-answering-demo.png",
  },
  {
    id: "02",
    demoName: "1Cademy Assistant - Practice Tool",
    url: "https://www.youtube.com/embed/kU6ppO_WLC0",
    previewImage: "/home/demos/practice-tool-demo.png",
  },
  {
    id: "03",
    demoName: "1Cademy Assistant - Voice-based Practice",
    url: "https://www.youtube.com/embed/Un6s1rtfZVA",
    previewImage: "/home/demos/practice-preview.png",
  },
  {
    id: "04",
    demoName: "1Cademy Instructor and Student Dashboards",
    url: "https://www.youtube.com/embed/9vWGSEBf8WQ",
    previewImage: "/home/demos/introduction-instructor-ad-student-dashboard.png",
  },
  {
    id: "05",
    demoName: "1Cademy Auto-graded Assignments and Exams",
    url: "https://www.youtube.com/embed/E2ClCIX9g0g",
    previewImage: "/home/demos/auto-graded-assignments-and-Exams.png",
  },
];

export const Demos = () => {
  const [displayVideo, setDisplayVideo] = useState("");

  return (
    <Box>
      <Typography component={"h3"} sx={{ fontSize: "20px", fontWeight: 600, my: "32px" }}>
        Demos
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
          columnGap: "32px",
          rowGap: { xs: "32px", md: "64px" },
          // border: "solid 2px royalBlue",
        }}
      >
        {DEMOS_ITEMS.map(cur => (
          <Box
            key={cur.id}
            onClick={() => setDisplayVideo(cur.url)}
            sx={{
              width: "100%",
              // border: "solid 2px pink",
            }}
          >
            <Box
              sx={{
                height: "200px",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundImage: `url(${cur.previewImage})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "contain",
                ":hover": {
                  cursor: "pointer",
                  svg: {
                    fill: DESIGN_SYSTEM_COLORS.primary600,
                  },
                },
              }}
            >
              <PlayCircleIcon sx={{ fontSize: "50px", color: DESIGN_SYSTEM_COLORS.baseWhite }} />
            </Box>
            <Typography
              sx={{
                mb: "8px",
                ml: "14px",
                fontWeight: 600,
                fontSize: "18px",
                color: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray25 : DESIGN_SYSTEM_COLORS.gray900,
              }}
            >
              {cur.demoName}
            </Typography>
          </Box>
        ))}
      </Box>

      <Modal
        open={Boolean(displayVideo)}
        onClose={() => setDisplayVideo("")}
        // ariaLabelledby="modal-modal-title"
        // aria-describedby="modal-modal-description"
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <iframe
          width="560"
          height="315"
          src={displayVideo}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen={true}
        ></iframe>
      </Modal>
    </Box>
  );
};
