// import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
// import ShareIcon from "@mui/icons-material/Share";
import CodeIcon from "@mui/icons-material/Code";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import LockIcon from "@mui/icons-material/Lock";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ShareIcon from "@mui/icons-material/Share";
import { Box, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { TutorialState, TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

dayjs.extend(relativeTime);
// const STEPS_LENGHT = 47; // 65

// const DISABLE_NOTEBOOK_OPTIONS = [
//   "TOOLBAR",
//   "LIVENESS_BAR",
//   "COMMUNITY_LEADERBOARD",
//   "SCROLL_TO_NODE_BUTTON",
//   "FOCUS_MODE_BUTTON",
// ];

const getStepsValues = (step: number, max: number) => {
  // steps = [1,...max]
  return {
    currentStepName: step,
    nextStepName: step === max ? 0 : step + 1,
    previosStepName: step === 1 ? 1 : step - 1,
  };
};

const getBaseStepConfig = (step: number, max: number) => {
  // DON'T CHANGE THIS, THIS WILL OVERRIDE ALL STEPS 🚨

  const tt: TutorialStep = {
    targetId: "",
    title: "",
    description: null,
    anchor: "",
    ...getStepsValues(step, max),
    tooltipPosition: "top",
    largeTarget: false,
  };

  return tt;
};

/**
EX: for notebook sections
 "TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD", "SCROLL_TO_NODE_BUTTON", "FOCUS_MODE_BUTTON"
Ex for Node id elements to disable
  "close-button",
  "open-button",
  "hide-offsprings-button",
  "hide-button",
  "node-footer-user",
  "node-footer-propose",
  "node-footer-downvotes",
  "node-footer-upvotes",
  "node-footer-tags-citations",
  "button-parent-children",
  "node-footer-ellipsis",
  "reference-button-0"
  "tag-button-0"
  "node-footer-menu"
 */

const NODES_STEPS: TutorialStepConfig[] = [
  {
    title: "What is a Node",
    description: (
      <MarkdownRender
        text={
          "This is a node. It is the most fundamental unit of knowledge on 1Cademy. Each node contains a granular piece of information. Nodes are linked to other nodes allowing us to follow related concepts."
        }
      />
    ),
  },

  {
    childTargetId: "node-title",
    title: "Node Title",
    description: (
      <MarkdownRender
        text={
          "Each node has a title. It accurately and concisely introduces the idea that is described in a node. Node titles need to be unique, this means that you need to make one that is specific to the idea being discussed and that cannot be confused with another node."
        }
      />
    ),
    largeTarget: true,
  },

  {
    childTargetId: "node-content",
    title: "Node Content",
    description: (
      <MarkdownRender
        text={
          "Here is the content of a node. It describes the idea stated in the title. It needs to be descriptive and concise. You can also include images or video in a node’s content."
        }
      />
    ),
  },

  {
    childTargetId: "node-footer-user",
    title: "Node Contributor",
    description: (
      <MarkdownRender
        text={
          "Here you can see the top contributor to a node. 1Cademy is a collaborative platform, many people contribute to the content. However, the system identifies who contributes most to a node and they’re profile is displayed on the node."
        }
      />
    ),
  },

  {
    childTargetId: "node-footer-type",
    title: "Node Type",
    description: (
      <>
        <MarkdownRender text={"This indicates what type of node this is. There are six types of nodes on 1Cademy."} />
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", mt: "10px" }}>
          <Stack alignItems={"center"}>
            <LocalLibraryIcon color="primary" />
            <Typography>Concept</Typography>
          </Stack>
          <Stack alignItems={"center"}>
            <ShareIcon color="primary" />
            <Typography>Relation</Typography>
          </Stack>
          <Stack alignItems={"center"}>
            <MenuBookIcon color="primary" />
            <Typography>Reference</Typography>
          </Stack>
          <Stack alignItems={"center"}>
            <HelpOutlineIcon color="primary" />
            <Typography>Question</Typography>
          </Stack>
          <Stack alignItems={"center"}>
            <CodeIcon color="primary" />
            <Typography>Code</Typography>
          </Stack>
          <Stack alignItems={"center"}>
            <EmojiObjectsIcon color="primary" />
            <Typography>Idea</Typography>
          </Stack>
          <Stack alignItems={"center"}>
            <LockIcon color="primary" />
            <Typography>Lock</Typography>
          </Stack>
        </Box>
      </>
    ),
  },

  {
    childTargetId: "node-footer-timestamp",
    title: "Last update",
    description: <MarkdownRender text={"The third icon indicates how long ago the node was updated."} />,
  },

  {
    childTargetId: "node-footer-propose",
    title: "Node Footer",
    description: (
      <MarkdownRender
        text={
          "The fourth one is the purpose/evaluate button. This allows you to edit the node or add child nodes to it."
        }
      />
    ),
  },

  {
    childTargetId: "node-footer-votes",
    title: "Votes",
    description: (
      <MarkdownRender
        text={
          "The next two icons are the downvote and upvote buttons, which also display each number of votes the node has received."
        }
      />
    ),
  },

  {
    childTargetId: "node-footer-upvotes",
    title: "Node Downvotes",
    description: (
      <MarkdownRender
        text={
          "Click the upvote button to signal the community that the current state of this node is so helpful that you'd like to lock it from further changes."
        }
      />
    ),
    isClickeable: true,
  },

  {
    childTargetId: "node-footer-downvotes",
    title: "Node Upvotes",
    description: (
      <MarkdownRender
        text={
          "Click the downvote button to vote for deleting the node. The node will be deleted, as soon as it gets more downvotes than upvotes (negative netvotes)."
        }
      />
    ),
    isClickeable: true,
  },

  {
    childTargetId: "node-footer-votes",
    title: "Netvotes",
    description: (
      <MarkdownRender
        text={
          "The number of upvotes minus downvotes, called netvotes, determines how many or few approving votes a proposal needs in order to make the proposed changes to the node. This will be discussed further later on."
        }
      />
    ),
  },

  {
    childTargetId: "node-footer-tags-citations",
    title: "Tags and Ciitations",
    description: (
      <MarkdownRender
        text={
          "The next icons are on a single button and represent the cited references and tags on the node. **Click** the button to expand."
        }
      />
    ),
    isClickeable: true,
  },

  {
    childTargetId: "button-parent-children",
    title: "Parents and Children",
    description: (
      <MarkdownRender text={"The next icon is for parent and child nodes. **Click** the button to expand. "} />
    ),
    isClickeable: true,
  },

  {
    childTargetId: "node-footer-ellipsis",
    title: "More Options",
    description: (
      <MarkdownRender
        text={
          "Finally, click the ellipses button to mark a node as **Studied**, **“Bookmark”** the node for later review, you can make it **“Narrated”** for you and share the node on your Twitter, Reddit, Facebook, or Linkedin profiles. "
        }
      />
    ),
    isClickeable: true,
  },
];

export const NODES_STEPS_COMPLETE: TutorialStep[] = NODES_STEPS.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
