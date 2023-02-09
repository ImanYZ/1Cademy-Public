import { Stack, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

import { gray200, gray600 } from "@/pages/home";

import { RiveComponentMemoized } from "../home/components/temporals/RiveComponentExtended";

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
    animation: {
      src: "rive/notebook.riv",
      artboard: "artboard-4",
    },
  },
  {
    id: "Evaluating",
    title: "Voting",
    description:
      "To ensure the quality of the knowledge graph on 1Cademy, we have implemented a peer-review process. Each individual concept, represented as a node, can be voted on by members of the community, and the score of the node will determine its level of modification or the possibility of deletion.",
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

  // const { width } = useWindowSize();

  // const canvasDimensions = useMemo(() => {
  //   let newWidth = width - 10;

  //   if (width >= 600) newWidth = 500;
  //   if (width >= 900) newWidth = 350;
  //   if (width >= 1200) newWidth = 550;

  //   const newHeight = getHeight(newWidth);
  //   return { width: newWidth, height: newHeight };
  // }, [width]);
  // useEffect(() => {
  //   let newWidth = width / 2;
  //   if (width >= 1536) newWidth = 850;
  //   else if (width >= 1200) newWidth = 750;
  //   else if (width >= 900) newWidth = 700;
  //   else if (width >= 600) newWidth = 540;
  //   else if (width >= 375) newWidth = 370;
  //   else if (width >= 0) newWidth = width - 20;

  //   const newHeight = getHeight(newWidth);
  //   setCanvasDimension({ width: newWidth, height: newHeight });
  // }, [width]);

  return (
    <Box>
      {mechanisms.map((cur, idx) => (
        <Stack
          key={cur.id}
          direction={{ xs: "column", md: idx % 2 === 0 ? "row" : "row-reverse" }}
          spacing={{ xs: "32px", md: "16px" }}
          alignItems="center"
          justifyContent={"space-between"}
          sx={{ mb: { xs: "32px", md: "61px" } }}
        >
          <Box sx={{ maxWidth: { xs: "none", md: "500px" }, textAlign: "left", flex: 1 }}>
            <Typography component={"h3"} sx={{ fontSize: "30px", fontWeight: "600px", mb: "16px" }}>
              {cur.title}
            </Typography>
            <Typography sx={{ color: theme.palette.mode === "dark" ? gray200 : gray600 }}>{cur.description}</Typography>
          </Box>
          <Box
            sx={{
              width: { xs: "350px", sm: "500px", md: "550px", lg: "700px" },
              height: { xs: "350px", sm: "500px", md: "550px", lg: "700px" },
            }}
          >
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

export default Mechanism;
