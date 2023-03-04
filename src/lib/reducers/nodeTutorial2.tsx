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

import { TutorialState, TutorialStep, TutorialStepConfig } from "../../nodeBookTypes";

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
    title: "Introduction",
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
    title: "Introduction",
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
    title: "Introduction",
    description: (
      <MarkdownRender
        text={
          "Here is the content of a node. It describes the idea stated in the title. It needs to be descriptive and concise. You can also include images or video in a node’s content."
        }
      />
    ),
  },

  // {
  //   childTargetId: "parents-list",
  //   title: "Basic Navigation - Parent Nodes",
  //   description: <MarkdownRender text={"You can see the parent link(s) listed below in this panel."} />,
  // },

  // {
  //   childTargetId: "parent-button-0",
  //   title: "Basic Navigation - Parent Nodes",
  //   description: <MarkdownRender text={"Click on the link for “1Cademy."} />,
  //   isClickeable: true,
  // },

  // {
  //   title: "Basic Navigation - Parent Nodes",
  //   description: (
  //     <MarkdownRender text={`The parent node defines **${INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"].title}**`} />
  //   ),
  // },

  // {
  //   childTargetId: "children-list",
  //   title: "Basic Navigation - Children Nodes",
  //   description: (
  //     <MarkdownRender
  //       text={
  //         "Most nodes have children. After learning the “1Cademy Nodes” node, you can expand your knowledge by learning from its children."
  //       }
  //     />
  //   ),
  // },

  // {
  //   childTargetId: "children-list",
  //   title: "Basic Navigation - Children Nodes",
  //   description: <MarkdownRender text={"You can see the children link(s) listed below in this panel."} />,
  // },

  // {
  //   childTargetId: "child-button-0",
  //   title: "Basic Navigation - Children Nodes",
  //   description: <MarkdownRender text={`Click here to view the first child node for “1Cademy Nodes”`} />,
  //   isClickeable: true,
  // },

  // {
  //   targetId: "02",
  //   title: "Basic Navigation - Children Nodes",
  //   description: <MarkdownRender text={"Here you can see the child node for “1Cademy Nodes”."} />,
  // },

  // {
  //   targetId: "02",
  //   title: "Learning Pathways",
  //   description: (
  //     <MarkdownRender
  //       text={
  //         "We can keep opening child nodes to create branches of nodes. These are learning pathways, and we can use these to follow information from basic to advanced."
  //       }
  //     />
  //   ),
  // },

  // {
  //   targetId: "02",
  //   childTargetId: "02-button-parent-children",
  //   title: "Learning Pathways",
  //   description: <MarkdownRender text={"open the children of “Creating or improving a node in 1Cademy”."} />,
  //   isClickeable: true,
  // },

  // {
  //   targetId: "02",
  //   childTargetId: "02-child-button-0",
  //   title: "Learning Pathways",
  //   description: (
  //     <MarkdownRender
  //       text={"Open the first child node “Modifications in 1Cademy” and continue expanding the learning pathway."}
  //     />
  //   ),
  //   isClickeable: true,
  // },

  // {
  //   targetId: "03",
  //   childTargetId: "03-button-parent-children",
  //   title: "Learning Pathways",
  //   description: <MarkdownRender text={"Now open the children of “Modifications in 1Cademy”."} />,
  //   isClickeable: true,
  // },

  // {
  //   targetId: "03",
  //   childTargetId: "03-child-button-0",
  //   title: "Learning Pathways",
  //   description: <MarkdownRender text={"Click on “Adding a new node to 1Cademy”."} />,
  //   isClickeable: true,
  // },

  // {
  //   targetId: "04",
  //   title: "Learning Pathways",
  //   description: (
  //     <MarkdownRender
  //       text={"While we can open a lot of nodes, it is important to try to keep your map tidy and close unused nodes."}
  //     />
  //   ),
  // },

  // {
  //   targetId: "04",
  //   childTargetId: "04-hiden-button",
  //   title: "Learning Pathways",
  //   description: (
  //     <MarkdownRender
  //       text={
  //         "Hiding a node does not delete it, it only hides it from your notebook. You can always search and return it to your notebook."
  //       }
  //     />
  //   ),
  // },

  // {
  //   targetId: "04",
  //   childTargetId: "04-hiden-button",
  //   title: "Learning Pathways",
  //   description: (
  //     <MarkdownRender
  //       text={"To hide the “Adding a new node to 1Cademy” node, click the “X” button at the top right of the node."}
  //     />
  //   ),
  //   isClickeable: true,
  // },

  // {
  //   childTargetId: "hide-offsprings-button",
  //   title: "Learning Pathways",
  //   description: (
  //     <MarkdownRender
  //       text={
  //         'To hide all the off-springs of the node "1Cademy Nodes", click the “|<--” button at the top right of the node.'
  //       }
  //     />
  //   ),
  //   isClickeable: true,
  // },

  // {
  //   childTargetId: "close-button",
  //   title: "Learning Pathways",
  //   description: (
  //     <MarkdownRender
  //       text={'To collapse the node “1Cademy Nodes” click the "-" button, so only the title is displayed.'}
  //     />
  //   ),
  //   isClickeable: true,
  // },

  // {
  //   childTargetId: "node-header",
  //   title: "Nodes - Node Header",
  //   description: (
  //     <MarkdownRender
  //       text={"The three buttons in the node header help you modify the view of the knowledge graph in your notebook."}
  //     />
  //   ),
  // },

  // {
  //   childTargetId: "open-button",
  //   title: "Nodes - Node Header",
  //   description: <MarkdownRender text={"To expand a node to see its content again, click this button."} />,
  //   isClickeable: true,
  // },

  // -------------------- FOOTER

  // {
  //   childTargetId: "node-footer",
  //   title: "Nodes - Node Footer",
  //   description: <MarkdownRender text={"The node footer provides many tools."} />,

  //   // tooltipPosition: "top",
  // },

  {
    childTargetId: "node-footer-user",
    title: "Nodes - Node Footer",
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
    title: "Nodes - Node Footer",
    description: (
      <>
        <MarkdownRender
          text={
            "This indicates what type of node this is, this is a ______ node. There are six types of nodes on 1Cademy."
          }
        />
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
    title: "Nodes - Node Footer",
    description: <MarkdownRender text={"The third icon indicates how long ago the node was updated."} />,
  },

  {
    childTargetId: "node-footer-propose",
    title: "Nodes - Node Footer",
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
    title: "Nodes - Node Footer",
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
    title: "Nodes - Node Footer",
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
    title: "Nodes - Node Footer",
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
    title: "Nodes - Node Footer",
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
    title: "Nodes - Node Footer",
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
    title: "Nodes - Node Footer",
    description: (
      <MarkdownRender text={"The next icon is for parent and child nodes. **Click** the button to expand. "} />
    ),
    isClickeable: true,
  },

  {
    childTargetId: "node-footer-ellipsis",
    title: "Nodes - Node Footer",
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
