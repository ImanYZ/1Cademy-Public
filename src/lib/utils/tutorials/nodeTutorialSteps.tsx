import CodeIcon from "@mui/icons-material/Code";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import LockIcon from "@mui/icons-material/Lock";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ShareIcon from "@mui/icons-material/Share";
import { Box, Stack, Typography } from "@mui/material";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { TutorialState, TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

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
    outline: "outside",
    tooltipPosition: "left",
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
    tooltipPosition: "right",
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
    tooltipPosition: "bottom",
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
          "This button is to propose a new node or evaluate versions of the current node. This is where you go to add a new node, edit the current node, or evaluate other proposed edits to the node."
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
    childTargetId: "node-footer-downvotes",
    title: "Node Downvotes",
    description: (
      <MarkdownRender
        text={
          "This is the downvote button. You can downvote nodes that you think are inaccurate. A downvote is a vote to remove a node and it lowers the threshold of approvals needed for a proposed change to that node."
        }
      />
    ),
    isClickeable: true,
  },

  {
    childTargetId: "node-footer-upvotes",
    title: "Node Upvotes",
    description: (
      <MarkdownRender
        text={
          "This is the upvote button. You can upvote nodes that you think are good. An upvote is a vote to not change a node because upvotes make it more difficult to delete or change a node."
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
    title: "Tags and Citations",
    description: (
      <MarkdownRender
        text={
          "This button is for tags and citations. When you click on it you see a panel that contains the sources used to create the node and a panel that shows all the tags for the node."
        }
      />
    ),
    isClickeable: true,
  },

  {
    childTargetId: "button-parent-children",
    title: "Parents and Children",
    description: (
      <MarkdownRender
        text={
          "This button displays the parent and child nodes linked to the node. The left panel displays the parent or superordinate nodes and the right panel displays child or subordinate nodes."
        }
      />
    ),
    isClickeable: true,
  },

  {
    childTargetId: "node-footer-ellipsis",
    title: "More Options",
    description: (
      <MarkdownRender
        text={
          "This button gives you the options to bookmark and mark a node as studied. It also gives you the option to have a node narrated and to share a node on social media."
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
