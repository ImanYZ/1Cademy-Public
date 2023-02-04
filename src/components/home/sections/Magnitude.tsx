import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import React, { useMemo } from "react";

import { useWindowSize } from "../../../hooks/useWindowSize";

const MAGNITUDE_ITEMS = [
  {
    id: "students-and-researchers",
    value: 1529,
    title: "Students and Researchers",
    description: "Over the past two years joined 1Cademy.",
  },
  {
    id: "institutions",
    value: 183,
    title: "Institutions",
    description: "Have participated in a large-scale collaboration effort through 1Cademy",
  },
  { id: "nodes", value: 44_665, title: "Nodes", description: "Are generated through this large-scale collaboration." },
  {
    id: "prerequisite-links",
    value: 235_674,
    title: "Prerequisite links",
    description: "Are connected between nodes.",
  },
];

const Magnitude = () => {
  const { width } = useWindowSize();

  const imageDimensions = useMemo(() => {
    let newWidth = width - 100;

    if (width >= 600) newWidth = 560;
    if (width >= 900) newWidth = 400;
    if (width >= 1200) newWidth = 560;

    return { width: newWidth, height: newWidth };
  }, [width]);

  return (
    <Stack direction={{ sx: "column-reverse", md: "row" }} alignItems={"center"} spacing={"96px"}>
      <Box
        sx={{
          width: { md: "560px" },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          rowGap: "88px",
        }}
      >
        {MAGNITUDE_ITEMS.map(cur => (
          <Box key={cur.id} sx={{ textAlign: "center", maxWidth: "264px" }}>
            <Typography sx={{ fontSize: { xs: "48px", md: "60px" }, mb: "12px", color: "#FF6D00", fontWeight: 600 }}>
              {cur.value.toLocaleString()}
            </Typography>
            <Typography component={"h3"} sx={{ fontSize: "18px", fontWeight: 600 }}>
              {cur.title}
            </Typography>
            <Typography>{cur.description}</Typography>
          </Box>
        ))}
      </Box>
      <Box>
        <img src="home/1Cademy.png" alt="1cademy logo" width={imageDimensions.width} height={imageDimensions.height} />
      </Box>
    </Stack>
  );
};

export default Magnitude;
