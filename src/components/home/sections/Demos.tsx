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
    demoName: "Introducing 1Cademy Assistant - Practice Tool",
    url: "https://www.youtube.com/embed/kU6ppO_WLC0",
    previewImage: "/home/demos/practice-tool-demo.jpg",
  },
  {
    id: "02",
    demoName: "Introducing 1Cademy Assistant - Question Answering",
    url: "https://www.youtube.com/embed/Z8aVR459Kks",
    previewImage: "/home/demos/question-answering-demo.jpg",
  },
];

export const Demos = () => {
  const [displayVideo, setDisplayVideo] = useState("");

  return (
    <Box>
      <Typography component={"h3"} sx={{ fontSize: "20px", fontWeight: 600, mb: "32px" }}>
        Demos
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr", lg: "1fr 1fr 1fr 1fr" },
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
                backgroundRepeat: "none",
                backgroundPosition: "center",
                backgroundSize: "cover",
                ":hover": {
                  cursor: "pointer",
                  border: `solid 2px ${DESIGN_SYSTEM_COLORS.primary600}`,
                  svg: {
                    fill: DESIGN_SYSTEM_COLORS.primary600,
                  },
                },
              }}
            >
              <PlayCircleIcon sx={{ fontSize: "50px", color: DESIGN_SYSTEM_COLORS.baseGraphit }} />
            </Box>
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
