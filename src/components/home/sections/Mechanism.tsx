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
      "1Cademy's goal is to streamline the learning process by converting human knowledge into easily digestible micro-content that eliminates redundancy. By combining various perspectives for a given concept within a particular discipline, learners can master this concept by referring to a single comprehensive piece of micro-content. To achieve this, 1Cademy uses human-AI collaboration to gather valuable knowledge from multiple sources and merges it into concise pieces. This collaborative note-taking approach ensures that the micro-content is applicable to various students studying the same topics, beyond the scope of just one semester.",
    animation: {
      src: "rive/summarizing.riv",
      artboard: "New Artboard",
    },
  },
  {
    id: "linking",
    title: "Linking",
    description:
      'Efficient learning requires progressive learning content without overlapping knowledge that creates redundancy. 1Cademy divides learning content into micro-content that define a single concept and can be used in a variety of learning contexts and goals. This mitigates the redundancy and disorientation of reading a concept defined in different ways from numerous pieces of literature. This can be achieved through a comprehensive "prerequisite knowledge graph" of micro-content. To address competing or conflicting claims on a given concept, we link the differing views to a generic definition of the concept so that the opposed views can be compared in a side-by-side presentation. 1Cademy notebooks are knowledge graphs of these micro-content pieces, shared among many learners and researchers, who continually improve and add perspectives to the content over time.',
    animation: {
      src: "rive/linking.riv",
      artboard: "New Artboard",
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
            {cur.description.split("\n").map((paragraph: string, idx: number) => (
              <Typography key={idx} sx={{ color: theme.palette.mode === "dark" ? gray200 : gray600, mb: "8px" }}>
                {paragraph}
              </Typography>
              // <Typography
              //   key={idx}
              //   fontSize={"16px"}
              //   color={theme.palette.mode === "light" ? "#475467" : "#EAECF0"}
              //   sx={{ p: "8px", pt: "0" }}
              // >
              //   {wrapStringWithBoldTag(paragraph, RE_DETECT_NUMBERS_WITH_COMMAS)}
              // </Typography>
            ))}
            {/* <Typography sx={{ color: theme.palette.mode === "dark" ? gray200 : gray600 }}>{cur.description}</Typography> */}
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
