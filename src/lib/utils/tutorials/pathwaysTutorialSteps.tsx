import { Typography } from "@mui/material";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const PATHWAYS_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    title: "Learning pathways",
    description: (
      <MarkdownRender
        text={
          "1Cademy simplifies the development of learning pathways: nodes in the knowledge graph that guide you from basic to complex concepts. Presented in prerequisite order, the pathways offer foundational knowledge at the outset, advancing to more specialized knowledge as you progress."
        }
      />
    ),
    tooltipPosition: "top",
    outline: "inside",
  },
  {
    title: "Parents/prerequisites",
    description: (node, nodeParent) => (
      <Typography>
        One would be able to better learn a node, if they first learn its parent/prerequisite nodes. For example, the node about{' "'}
        <Typography component={"b"} fontWeight="bold">
          {nodeParent ? nodeParent.title : "the Parent"}
        </Typography>{'" '}
        is a parent of the current node.
        {/* You can open the {nodeParent?.title} node to get the foundational information. */}
      </Typography>
    ),
    tooltipPosition: "top",
    outline: "inside",
  },
  // {
  //   title: "Pathways",
  //   description: node => (
  //     <Typography>You can also open a child node of {node.title}. Lets open one child node.</Typography>
  //   ),
  //   tooltipPosition: "top",
  //   outline: "inside",
  // },
  {
    title: "Children/follow-ups",
    description: (node, parent, child) => (
      <Typography>
        A child node is usually about a more specific/advanced topic. One would better learn a child node if they first learn its parent/prerequisite node(s). For example, it is better to learn the current node before learning its child node about {' "'}
        <Typography component={"b"} fontWeight="bold">
          {child ? child.title : "the Child"}
        </Typography>{'"'}
      </Typography>
    ),
    tooltipPosition: "top",
    outline: "inside",
  },
  {
    title: "Learning pathways example",
    description: (node, parent, child) => (
      <Typography>
        These nodes are in an ordered series where they flow from basic to advanced, or broad to specific. The learner can start with the node about{' "'}
        <Typography component={"b"} fontWeight="bold">
          {parent ? parent.title : "the Parent"}
        </Typography>{'" '}
        Only after gaining the prerequisite knowledge, they can continue with learning about{' "'}
        <Typography component={"b"} fontWeight="bold">
          {node.title}{'"'}
        </Typography>
        , and then, in turn, they would have enough knowledge to learn about{' "'}
        <Typography component={"b"} fontWeight="bold">
          {child ? child.title : "the Child"}
        </Typography>{'" '}
        This ordered series is a learning pathway.
      </Typography>
    ),
    tooltipPosition: "top",
    outline: "inside",
  },
  {
    title: "Stepwise learning",
    description: (
      <Typography>
        Learning pathways allow us to learn multiple concepts in a progressive manner where we first gain the necessary
        foundational knowledge to be able to learn each subsequent node. At each step, learners gain the knowledge of one step further in their Zone of Proximal Development.
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
