import { Typography } from "@mui/material";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const PATHWAYS_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    title: "Pathways",
    description: (
      <MarkdownRender
        text={
          "1Cademy is designed to allow you to create learning pathways. Learning pathways are concepts arranged and displayed in order to allow you to learn from basic concepts to deeper ones. Because they are arranged in prerequisite order, you get foundational information with the first nodes and more specific knowledge as you read farther along the path."
        }
      />
    ),
    tooltipPosition: "top",
    outline: "inside",
  },
  {
    title: "Pathways",
    description: node => (
      <Typography>
        This is the {node.title} node. In order to understand it, you need to understand what 1Cademy is. You can open
        the 1Cademy node to get the foundational information.
      </Typography>
    ),
    tooltipPosition: "top",
    outline: "inside",
  },
  {
    title: "Pathways",
    description: node => (
      <Typography>You can also open a child node of {node.title}. Lets open one child node.</Typography>
    ),
    tooltipPosition: "top",
    outline: "inside",
  },
  {
    title: "Pathways",
    description: node => (
      <Typography>
        This is a more specific node. The reader needs to understand {node.title} to understand the opened child node.
        Links.
      </Typography>
    ),
    tooltipPosition: "top",
    outline: "inside",
  },
  {
    title: "Pathways",
    description: node => (
      <Typography>
        These nodes are in an ordered series where they flow from broad to specific. The reader can start with 1Cademy
        and have the requisite knowledge to understand {node.title}, and then, in turn, they have enough knowledge to
        understand advanced knowledge. This ordered series is a learning pathway.
      </Typography>
    ),
    tooltipPosition: "top",
    outline: "inside",
  },
  {
    title: "Pathways",
    description: (
      <Typography>
        Learning pathways allow us to learn multiple concepts in a progressive manner where we have the necessary
        foundational information to understand each subsequent node.
      </Typography>
    ),
    tooltipPosition: "top",
    outline: "inside",
  },
];

export const PATHWAYS_STEPS: TutorialStep[] = PATHWAYS_STEPS_CONFIG.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
