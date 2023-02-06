import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import React, { useMemo } from "react";
import { useQuery } from "react-query";
import { StatsSchema } from "src/knowledgeTypes";

import { getStats } from "@/lib/knowledgeApi";
import { orangeDark } from "@/pages/home";

import { useWindowSize } from "../../../hooks/useWindowSize";

export type TMagnitudeItem = {
  id: keyof StatsSchema;
  value: string;
  title: string;
  description: string;
};

const MAGNITUDE_ITEMS: TMagnitudeItem[] = [
  {
    id: "users",
    value: "1529",
    title: "Students and Researchers",
    description: "Over the past two years joined 1Cademy.",
  },
  {
    id: "institutions",
    value: "183",
    title: "Institutions",
    description: "Have participated in a large-scale collaboration effort through 1Cademy",
  },
  {
    id: "nodes",
    value: "44_665",
    title: "Nodes",
    description: "Are generated through this large-scale collaboration.",
  },
  {
    id: "links",
    value: "235_674",
    title: "Prerequisite links",
    description: "Are connected between nodes.",
  },
];

const Magnitude = () => {
  const { width } = useWindowSize();

  const { data: stats } = useQuery("stats", getStats);

  const MAGNITUDE_ITEMS_Memo = useMemo(() => {
    if (!stats) return MAGNITUDE_ITEMS;

    const x = MAGNITUDE_ITEMS.reduce((acc, item) => {
      item.value = stats[item.id] ?? item.value;
      return [...acc, item];
    }, [] as TMagnitudeItem[]);
    return x;
  }, [stats]);

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
          maxWidth: { md: "560px" },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          rowGap: "88px",
          columnGap: "32px",
        }}
      >
        {MAGNITUDE_ITEMS_Memo.map(cur => (
          <Box key={cur.id} sx={{ textAlign: "center", maxWidth: "264px" }}>
            <Typography sx={{ fontSize: { xs: "48px", md: "60px" }, mb: "12px", color: orangeDark, fontWeight: 600 }}>
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
