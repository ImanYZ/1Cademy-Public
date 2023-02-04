import { Stack, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import React, { useMemo } from "react";

import { gray200, gray600 } from "@/pages/home";

import { useWindowSize } from "../../../hooks/useWindowSize";
import { RiveComponentMemoized } from "../components/temporals/RiveComponentExtended";

const MECHANISM_ITEMS = [
  {
    id: "summarizing",
    title: "Summarizing",
    description:
      "We gather valuable information from various sources such as books, articles, and videos, and divide it into granular pieces. We then combine these pieces into concise notes that focus on a single concept.\nTraditional note-taking methods often only benefit the individual for a short period of time, typically for a semester or two. 1Cademy's collaborative note-taking approach ensures that the notes are useful and usable for multiple students studying the same topics.",
    animation: {
      src: "rive/notebook.riv",
      artboard: "artboard-3",
    },
  },
  {
    id: "linking",
    title: "Linking",
    description:
      "Our notes, which are organized in granular pieces, can be transformed into a knowledge graph that visually illustrates the hierarchical relationships between concepts. The linking of concepts is beneficial as it helps us understand how concepts relate to one another and their place in broader topics, fields, or disciplines. ",
    animationSrc: "",
    animation: {
      src: "rive/notebook.riv",
      artboard: "artboard-4",
    },
  },
  {
    id: "voting",
    title: "Voting",
    description:
      "To ensure the quality of the knowledge graph on 1Cademy, we have implemented a peer-review process. Each individual concept, represented as a node, can be voted on by members of the community, and the score of the node will determine its level of modification or the possibility of deletion.",
    animationSrc: "",
    animation: {
      src: "rive/notebook.riv",
      artboard: "artboard-5",
    },
  },
  {
    id: "improving",
    title: "Improving",
    description:
      "We work together to improve the knowledge presented by continually updating and refining concepts. For each node, there are multiple versions proposed by different people.",
    animationSrc: "",
    animation: {
      src: "rive/notebook.riv",
      artboard: "artboard-6",
    },
  },
];

const Mechanism = () => {
  const theme = useTheme();
  const { width } = useWindowSize();

  const canvasDimensions = useMemo(() => {
    let newWidth = width - 10;

    if (width >= 600) newWidth = 500;
    if (width >= 900) newWidth = 350;
    if (width >= 1200) newWidth = 550;

    const newHeight = getHeight(newWidth);
    return { width: newWidth, height: newHeight };
  }, [width]);

  return (
    <Box>
      {MECHANISM_ITEMS.map((cur, idx) => (
        <Stack
          key={cur.id}
          direction={{ xs: "column", md: idx % 2 === 0 ? "row" : "row-reverse" }}
          spacing={{ xs: "32px", md: "auto" }}
          alignItems="center"
          justifyContent={"space-between"}
          minHeight={{ md: "512px" }}
          sx={{ mb: { xs: "32px", md: "61px" } }}
        >
          <Box sx={{ maxWidth: { md: "528px" }, textAlign: "left" }}>
            <Typography component={"h3"} sx={{ fontSize: "30px", fontWeight: "600px", mb: "16px" }}>
              {cur.title}
            </Typography>
            <Typography sx={{ color: theme.palette.mode === "dark" ? gray200 : gray600 }}>{cur.description}</Typography>
          </Box>
          <Box sx={{ width: canvasDimensions.width, height: canvasDimensions.height }}>
            <RiveComponentMemoized
              src={cur.animation.src}
              artboard={cur.animation.artboard}
              animations={["Timeline 1", theme.palette.mode]}
              autoplay={true}
            />
          </Box>
        </Stack>
      ))}
    </Box>
  );
};

const getHeight = (width: number) => (300 * width) / 500;

export default Mechanism;
