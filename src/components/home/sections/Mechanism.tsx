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
    id: "evaluating",
    title: "Evaluating",
    description:
      "To ensure the quality of the knowledge graph on 1Cademy, we have implemented an AI-enhanced peer-review process. Each individual concept, represented as a micro-content piece, is evaluated through a collaboration of AI and members of the community, and the score of the piece will determine its possibility for modification or deletion.",
    animation: {
      src: "rive/evaluating.riv",
      artboard: "New Artboard",
    },
  },
  {
    id: "improving",
    title: "Improving",
    description:
      "We collaborate with each other and AI assistance to improve the micro-content in the knowledge graph by continually updating and refining concepts. For each micro-content piece, there are multiple versions proposed by different people, which cover multiple perspectives and use-cases. 1Cademy visualizes these side-by-side to optimize learning.",
    animation: {
      src: "rive/improving.riv",
      artboard: "New Artboard",
    },
  },
  {
    id: "long-term-learning",
    title: "Long-term Learning",
    description:
      "1Cademy Assistant uses a personalized question-asking approach, leveraging the prerequisite relations in the 1Cademy knowledge graph as well as the student's prior answers. Upon answering correctly, students are guided towards more advanced topics, while incorrect answers result in a review of the topic's prerequisites to ensure a strong foundation before proceeding. Through this method, students can earn a daily point for answering ten questions correctly, which has been shown through years of experimentation to increase motivation and encourage spaced-out practice throughout the semester. Our research has found that this approach is especially beneficial for students with lower GPAs, ultimately leading to improved exam scores. By combining the power of the 1Cademy knowledge graph, personalized practice history, and the counting days incentive, 1Cademy Assistant is a highly effective tool for facilitating long-term learning.",
    animation: {
      src: "rive/long-term-learning.riv",
      artboard: "New Artboard",
    },
  },
  {
    id: "contextualized-q-a",
    title: "Contextualized Q&A",
    description: `
    1Cademy Assistant is an intelligent system that leverages the power of 1Cademy's knowledge graph to provide personalized question answering to learners. By analyzing the learner's history of answers to practice questions and understanding the prerequisite relationships between the topics covered in the course, the system can provide learners with context-specific guidance. This not only helps learners understand what is covered in the course, but also what lies beyond its boundaries. Additionally, 1Cademy Assistant helps learners develop metacognitive skills by providing insights into why they may be struggling with a specific concept. The system can trace these difficulties back to the prerequisite topics they had difficulty with, helping them to build a more comprehensive understanding of the subject. Finally, 1Cademy Assistant provides instructors with insightful reports on each student's personalized learning journey, allowing them to fine-tune their teaching strategies to better serve their students' needs.
    `,
    animation: {
      src: "rive/contextualized-q-a.riv",
      artboard: "New Artboard",
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

    if (width >= 600) newWidth = 600;
    if (width >= 900) newWidth = 700;
    if (width >= 1200) newWidth = 500;

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
          sx={{ mb: { xs: "32px", md: "48px" } }}
        >
          <Box sx={{ maxWidth: { md: "528px" }, textAlign: "left", flex: 1 }}>
            <Typography component={"h3"} sx={{ fontSize: "30px", fontWeight: "600", mb: "16px" }}>
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
          <Box
            sx={{
              width: canvasDimensions.width,
              height: canvasDimensions.height,
              display: "grid",
              placeItems: "center",
            }}
          >
            <RiveComponentMemoized
              src={cur.animation.src}
              artboard={cur.animation.artboard}
              animations={["Timeline 1", theme.palette.mode]}
              autoplay={true}
              displayControls
            />
          </Box>
        </Stack>
      ))}
    </Box>
  );
};

const getHeight = (width: number) => width;

export default Mechanism;
