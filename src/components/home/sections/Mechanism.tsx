import { Stack, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import React, { useMemo } from "react";

import { gray200, gray600 } from "@/pages/home";

import { useWindowSize } from "../../../hooks/useWindowSize";
import { RiveComponentMemoized } from "../components/temporals/RiveComponentExtended";

export type TMechanisms = {
  id: string;
  title: string;
  description: string;
  animation: {
    src: string;
    artboard: string;
  };
};
export const MECHANISM_ITEMS: TMechanisms[] = [
  {
    id: "summarizing",
    title: "Summarizing",
    description:
      "Through a human-AI collaboration, we gather valuable information from various sources such as books, articles, and videos, divide it into granular pieces, and identify the overlapping pieces. We then combine them into concise notes, each focusing on a single concept. Traditional note-taking methods often only benefit the individual for a short period of time, typically for a semester or two. 1Cademy's human-AI collaborative note-taking approach ensures that the notes are useful and usable for multiple students studying the same topics.",
    animation: {
      src: "rive/notebook.riv",
      artboard: "artboard-3",
    },
  },
  {
    id: "linking",
    title: "Linking",
    description:
      "To facilitate efficient learning we need to develop progressive learning content, but the representation of the granular notes should not be combined into multiple larger constructs, such as books or collections. Doing so perpetuates the issue of overlapping content and knowledge overload because larger constructs require contextual knowledge that are also covered in other large constructs. While they provide progressive learning content, in the aggregate they create a surplus of overlapping knowledge and defeat the purpose of efficient learning. Instead, we need to develop a single, comprehensive “prerequisite knowledge graph” of the granular notes.",
    animation: {
      src: "rive/notebook.riv",
      artboard: "artboard-4",
    },
  },
  {
    id: "Evaluating",
    title: "Voting",
    description:
      "To ensure the quality of the knowledge graph on 1Cademy, we have implemented an AI-enhanced peer-review process. Each individual concept, represented as a node, is evaluated through a collaboration of AI and members of the community, and the score of the node will determine its level of modification or the possibility of deletion.",
    animation: {
      src: "rive/notebook.riv",
      artboard: "artboard-5",
    },
  },
  {
    id: "improving",
    title: "Improving",
    description:
      "We collaborate with each other and get AI assistance to improve the knowledge presented by continually updating and refining concepts. For each node, there are multiple versions proposed by different people which cover different perspectives and use-cases for each concept. 1Cademy visualizes these side-by-side to optimize learning.",
    animation: {
      src: "rive/notebook.riv",
      artboard: "artboard-6",
    },
  },
];

export interface IMechanism {
  mechanisms: TMechanisms[];
}

const Mechanism = ({ mechanisms }: IMechanism) => {
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
      {mechanisms.map((cur, idx) => (
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
