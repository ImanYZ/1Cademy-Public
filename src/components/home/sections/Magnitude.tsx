import { Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { collection, getFirestore, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { StatsSchema } from "src/knowledgeTypes";

import { orangeDark } from "@/pages/home";

// import { useWindowSize } from "../../../hooks/useWindowSize";

export type MagnitudeItem = {
  id: keyof StatsSchema;
  value: string;
  title: string;
  description: string;
};

const MAGNITUDE_ITEMS: MagnitudeItem[] = [
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
    value: "44,665",
    title: "Nodes",
    description: "Are generated through this large-scale collaboration.",
  },
  {
    id: "links",
    value: "235,674",
    title: "Prerequisite links",
    description: "Are connected between nodes.",
  },
];

const Magnitude = () => {
  const db = getFirestore();
  const [items, setItems] = useState<MagnitudeItem[]>(MAGNITUDE_ITEMS);

  useEffect(() => {
    const statsRef = collection(db, "stats");
    const q = query(statsRef, orderBy("createdAt", "desc"), limit(1));
    const unsub = onSnapshot(q, snapshot => {
      if (!snapshot.docs.length) return;

      const stats = snapshot.docs[0].data();
      setItems(prevItems => {
        return prevItems.reduce((acc, item) => {
          const newValue = stats[item.id] ?? item.value;
          return [...acc, { ...item, value: newValue }];
        }, [] as MagnitudeItem[]);
      });
    });
    return () => unsub();
  }, [db]);

  return (
    <Stack direction={{ sx: "column-reverse", md: "row" }} alignItems={"center"} spacing={"96px"}>
      <Box
        sx={{
          // maxWidth: { md: "560px" },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
          rowGap: "88px",
          columnGap: "32px",
        }}
      >
        {items.map(cur => (
          <Box key={cur.id} sx={{ textAlign: "center", maxWidth: "264px" }}>
            <Typography sx={{ fontSize: { xs: "48px", md: "60px" }, mb: "12px", color: orangeDark, fontWeight: 600 }}>
              {cur.value.toLocaleString()}
            </Typography>
            <Typography component={"h3"} sx={{ fontSize: "18px", fontWeight: 600, mb: "12px" }}>
              {cur.title}
            </Typography>
            <Typography>{cur.description}</Typography>
          </Box>
        ))}
      </Box>
    </Stack>
  );
};

export default Magnitude;
