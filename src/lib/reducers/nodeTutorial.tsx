// import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
// import ShareIcon from "@mui/icons-material/Share";
import CodeIcon from "@mui/icons-material/Code";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import LockIcon from "@mui/icons-material/Lock";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ShareIcon from "@mui/icons-material/Share";
import { Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { DispatchNodeTutorialAction, NodeTutorialState, SetStepType, TutorialState } from "../../nodeBookTypes";
import { INTERACTIVE_TUTORIAL_NOTEBOOK_NODES } from "../utils/interactiveTutorialNodes";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

dayjs.extend(relativeTime);
const STEPS_LENGHT = 45; // 65

const DISABLE_NOTEBOOK_OPTIONS = [
  "TOOLBAR",
  "LIVENESS_BAR",
  "COMMUNITY_LEADERBOARD",
  "SCROLL_TO_NODE_BUTTON",
  "FOCUS_MODE_BUTTON",
];

const getNextStep = (step: SetStepType): SetStepType => {
  if (!step) return 1;
  if (step === STEPS_LENGHT) return null;
  return (step + 1) as SetStepType;
};
const getPrevStep = (step: SetStepType): SetStepType => {
  if (!step) return null;
  if (step === 1) return 1;
  return (step - 1) as SetStepType;
};

const getStepsValues = (step: SetStepType) => {
  return {
    currentStepName: step,
    nextStepName: getNextStep(step),
    previosStepName: getPrevStep(step),
  };
};

const getBaseStepConfig = (step: SetStepType) => {
  // DON'T CHANGE THIS, THIS WILL OVERRIDE ALL STEPS 🚨

  const tt: NodeTutorialState = {
    localSnapshot: [],
    targetId: "",
    title: "",
    description: null,
    // Description can be added in markdown in this way
    // <MarkdownRender text={"This node defines a node in\n\n\n```js\nconsole.log('sd')\n```\n1Cademy!"} />
    disabledElements: [],
    enableChildElements: [],
    anchor: "",
    ...getStepsValues(step),
    tooltipPosition: "top",
    stepLenght: STEPS_LENGHT,
    isClickeable: false,
  };

  return tt;
};

/**
EX: for notebook sections
 "TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD", "SCROLL_TO_NODE_BUTTON", "FOCUS_MODE_BUTTON"
Ex for Node id elements to disable
  "01-close-button",
  "01-open-button",
  "01-hide-offsprings-button",
  "01-hide-button",
  "01-node-footer-user",
  "01-node-footer-propose",
  "01-node-footer-downvotes",
  "01-node-footer-upvotes",
  "01-node-footer-tags-citations",
  "01-button-parent-children",
  "01-node-footer-ellipsis",
  "01-reference-button-0"
  "01-tag-button-0"
  "01-node-footer-menu"
 */

export function nodeTutorialReducer(
  state: TutorialState,
  { payload, ...action }: DispatchNodeTutorialAction
): TutorialState {
  console.log({ state, payload });

  if (state && state.childTargetId) {
    const element = document.getElementById(state.childTargetId);
    if (element) {
      element.classList.remove("tutorial-target");
      element.classList.remove("tutorial-target-pulse");
    }
  }
  if (payload.callback) payload?.callback();

  switch (action.type) {
    case null:
      return null;

    case 1:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        targetId: "01",
        title: "Introduction",
        description: <MarkdownRender text={"This node defines a node in 1Cademy!."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01"],
      };

    case 2:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        targetId: "01",
        childTargetId: "01-node-body",
        title: "Introduction",
        description: <MarkdownRender text={"Each node has a body that consists of a title and content."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01"],
      };

    case 3:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        targetId: "01",
        childTargetId: "01-node-title",
        title: "Introduction",
        description: (
          <MarkdownRender
            text={
              "This is the title. Each node title should be unique, concise, and accurately describe the information within. Before proposing any node, please make sure a node with duplicate title does not exist."
            }
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01"],
      };

    case 4:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        targetId: "01",
        childTargetId: "01-node-title",
        title: "Introduction",
        description: (
          <MarkdownRender
            text={
              "For example, **“growth”** could be used in a number of titles in a number of subjects. Are we talking about an organism growing, a population growing, or economic growth? Make sure the title addresses what is specifically being discussed."
            }
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01"],
      };

    case 5:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        targetId: "01",
        childTargetId: "01-node-content",
        title: "Introduction",
        description: (
          <MarkdownRender
            text={
              "This is the content, the content of a node describes what is stated in a title. we want the content to be clear, concise, and accurate."
            }
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01"],
      };

    case 6:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        targetId: "01",
        childTargetId: "01-node-content-media",
        title: "Introduction",
        description: (
          <MarkdownRender text={"In addition to text, the content may include a small image or a short video."} />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01"],
      };

    // --- BASIC NAVIGATION

    case 7:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "modified",
            open: true,
            defaultOpenPart: null,
          },
        ],
        targetId: "01",
        childTargetId: "01-button-parent-children",
        title: "Basic Navigation - Parent Nodes",
        description: (
          <MarkdownRender
            text={
              "Most nodes have parents. To learn this node, first you should learn its parents (direct prerequisites). Click this button to see the node’s parent list."
            }
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01"],
        enableChildElements: ["01-button-parent-children"],
        isClickeable: true,
      };

    case 8:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "modified",
            open: true,
            defaultOpenPart: "LinkingWords",
          },
        ],
        targetId: "01",
        childTargetId: "01-parents-list",
        title: "Basic Navigation - Parent Nodes",
        description: <MarkdownRender text={"You can see the parent link(s) listed below in this panel."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01"],
      };

    case 9:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "modified",
            open: true,
            defaultOpenPart: "LinkingWords",
          },
        ],
        targetId: "01",
        childTargetId: "01-parent-button-0",
        title: "Basic Navigation - Parent Nodes",
        description: <MarkdownRender text={"Click on the link for “1Cademy."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01"],
        enableChildElements: ["01-parent-button-0"],
        isClickeable: true,
      };

    case 10:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "modified",
            open: true,
            defaultOpenPart: null,
          },
        ],
        targetId: "00",
        // childTargetId: "01-node-content",
        title: "Basic Navigation - Parent Nodes",
        description: (
          <MarkdownRender text={`The parent node defines **${INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"].title}**`} />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01", "00"],
      };
    case 11:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "modified",
            open: true,
            defaultOpenPart: "LinkingWords",
          },
        ],
        targetId: "01",
        childTargetId: "01-children-list",
        title: "Basic Navigation - Children Nodes",
        description: (
          <MarkdownRender
            text={
              "Most nodes have children. After learning the “1Cademy Nodes” node, you can expand your knowledge by learning from its children."
            }
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01", "00"],
      };
    case 12:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "modified",
            open: true,
            defaultOpenPart: "LinkingWords",
          },
        ],
        targetId: "01",
        childTargetId: "01-children-list",
        title: "Basic Navigation - Children Nodes",
        description: <MarkdownRender text={"You can see the children link(s) listed below in this panel."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01", "00"],
      };
    case 13:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "modified",
            defaultOpenPart: "LinkingWords",
            open: true,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["02"],
            nodeChangeType: "removed",
            open: true,
          },
        ],
        targetId: "01",
        childTargetId: "01-child-button-0",
        title: "Basic Navigation - Children Nodes",
        description: (
          <MarkdownRender
            text={`Click here to view the first child node for “Creating or Improving a node in 1Cademy”`}
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01", "00"],
        enableChildElements: ["01-child-button-0"],
        isClickeable: true,
      };
    case 14:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "modified",
            defaultOpenPart: null,
            open: true,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["02"],
            nodeChangeType: "added",
            open: true,
          },
        ],
        targetId: "02",
        title: "Basic Navigation - Children Nodes",
        description: (
          <MarkdownRender text={"Here you can see the child node for “Creating or Improving a node in 1Cademy”."} />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01", "00", "02"],
      };
    case 15:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            defaultOpenPart: null,
            nodeChangeType: "modified",
            open: true,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["02"],
            nodeChangeType: "modified",
            open: true,
          },
        ],
        targetId: "02",
        title: "Learning Pathways",
        description: (
          <MarkdownRender
            text={
              "We can keep opening child nodes to create branches of nodes. These are learning pathways, and we can use these to follow information from basic to advanced."
            }
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01", "00", "02"],
      };

    case 16:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "modified",
            open: true,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["02"],
            nodeChangeType: "modified",
            open: true,
            defaultOpenPart: null,
          },
        ],
        targetId: "02",
        childTargetId: "02-button-parent-children",
        title: "Learning Pathways",
        description: <MarkdownRender text={"open the children of “Creating or improving a node in 1Cademy”."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01", "00", "02"],
        enableChildElements: ["02-button-parent-children"],
        isClickeable: true,
      };
    case 17:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "modified",
            open: true,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["02"],
            nodeChangeType: "modified",
            open: true,
            defaultOpenPart: "LinkingWords",
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["03"],
            nodeChangeType: "removed",
            defaultOpenPart: null,
            open: true,
          },
        ],
        targetId: "02",
        childTargetId: "02-child-button-0",
        title: "Learning Pathways",
        description: (
          <MarkdownRender
            text={"Open the first child node “Modifications in 1Cademy” and continue expanding the learning pathway."}
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01", "00", "02"],
        enableChildElements: ["02-child-button-0"],
        isClickeable: true,
      };
    case 18: // UPDATE
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "modified",
            open: true,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["02"],
            nodeChangeType: "modified",
            open: true,
            defaultOpenPart: null,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["03"],
            nodeChangeType: "added",
            defaultOpenPart: null,
            open: true,
          },
        ],
        targetId: "03",
        childTargetId: "03-button-parent-children",
        title: "Learning Pathways",
        description: <MarkdownRender text={"Now open the children of “Modifications in 1Cademy”."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01", "00", "02", "03"],
        enableChildElements: ["03-button-parent-children"],
        isClickeable: true,
      };

    case 19:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "modified",
            open: true,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["02"],
            nodeChangeType: "modified",
            open: true,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["03"],
            nodeChangeType: "added",
            defaultOpenPart: "LinkingWords",
            open: true,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["04"],
            nodeChangeType: "removed",
            open: true,
          },
        ],
        targetId: "03",
        childTargetId: "03-child-button-0",
        title: "Learning Pathways",
        description: <MarkdownRender text={"Click on “Adding a new node to 1Cademy”."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01", "00", "02", "03"],
        enableChildElements: ["03-child-button-0"],
        isClickeable: true,
      };
    case 20:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "modified",
            open: true,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["02"],
            nodeChangeType: "modified",
            open: true,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["03"],
            nodeChangeType: "added",
            defaultOpenPart: null,
            open: true,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["04"],
            nodeChangeType: "added",
            open: true,
          },
        ],
        targetId: "04",
        title: "Learning Pathways",
        description: (
          <MarkdownRender
            text={
              "While we can open a lot of nodes, it is important to try to keep your map tidy and close unused nodes."
            }
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01", "00", "02", "03", "04"],
      };
    case 21:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "modified",
            open: true,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["02"],
            nodeChangeType: "modified",
            open: true,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["03"],
            nodeChangeType: "added",
            open: true,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["04"],
            nodeChangeType: "added",
            open: true,
          },
        ],
        targetId: "04",
        childTargetId: "04-hiden-button",
        title: "Learning Pathways",
        description: (
          <MarkdownRender
            text={
              "Hiding a node does not delete it, it only hides it from your notebook. You can always search and return it to your notebook."
            }
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01", "00", "02", "03", "04"],
      };
    case 22:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "modified",
            open: true,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["02"],
            nodeChangeType: "modified",
            open: true,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["03"],
            nodeChangeType: "added",
            open: true,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["04"],
            nodeChangeType: "added",
            open: true,
          },
        ],
        targetId: "04",
        childTargetId: "04-hiden-button",
        title: "Learning Pathways",
        description: (
          <MarkdownRender
            text={"To hide the “Adding a new node to 1Cademy” node, click the “X” button at the top right of the node."}
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01", "00", "02", "03", "04"],
        enableChildElements: ["04-hiden-button"],
        isClickeable: true,
      };
    case 23:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "modified",
            open: true,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["02"],
            nodeChangeType: "modified",
            open: true,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["03"],
            nodeChangeType: "added",
            open: true,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["04"],
            nodeChangeType: "removed",
            open: true,
          },
        ],
        targetId: "01",
        childTargetId: "01-hide-offsprings-button",
        title: "Learning Pathways",
        description: (
          <MarkdownRender
            text={
              'To hide all the off-springs of the node "1Cademy Nodes", click the “|<--” button at the top right of the node.'
            }
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01", "00", "02", "03", "04"],
        enableChildElements: ["01-hide-offsprings-button"],
        isClickeable: true,
      };
    case 24:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "modified",
            open: true,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["02"],
            nodeChangeType: "removed",
            open: true,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["03"],
            nodeChangeType: "removed",
            open: true,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["04"],
            nodeChangeType: "removed",
            open: true,
          },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["05"], nodeChangeType: "removed" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["06"], nodeChangeType: "removed" },
        ],
        targetId: "01",
        childTargetId: "01-close-button",
        title: "Learning Pathways",
        description: (
          <MarkdownRender
            text={'To collapse the node “1Cademy Nodes” click the "-" button, so only the title is displayed.'}
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01", "00", "02", "03", "04"],
        enableChildElements: ["01-close-button"],
        isClickeable: true,
      };

    case 25:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: false },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["02"],
            nodeChangeType: "removed",
            open: true,
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["03"],
            nodeChangeType: "removed",
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["04"],
            nodeChangeType: "removed",
          },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["05"], nodeChangeType: "removed" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["06"], nodeChangeType: "removed" },
        ],
        targetId: "01",
        childTargetId: "01-node-header",
        title: "Nodes - Node Header",
        description: (
          <MarkdownRender
            text={
              "The three buttons in the node header help you modify the view of the knowledge graph in your notebook."
            }
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00", "01", "05", "06"],
      };

    case 26:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: false },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["05"], nodeChangeType: "removed" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["06"], nodeChangeType: "removed" },
        ],
        targetId: "01",
        childTargetId: "01-open-button",
        title: "Nodes - Node Header",
        description: <MarkdownRender text={"To expand a node to see its content again, click this button."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00", "01"],
        enableChildElements: ["01-open-button"],
        isClickeable: true,
      };

    // -------------------- FOOTER
    case 27:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["05"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["06"] },
        ],
        targetId: "01",
        childTargetId: "01-node-footer",
        title: "Nodes - Node Footer",
        description: <MarkdownRender text={"The node footer provides many tools."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00", "01"],
        tooltipPosition: "top",
      };
    case 28:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["05"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["06"] },
        ],
        targetId: "01",
        childTargetId: "01-node-footer-user",
        title: "Nodes - Node Footer",
        description: (
          <MarkdownRender
            text={
              "The first is the profile button of the top contributor to the node. That is the person who has done the most to make the node in its present form."
            }
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00", "01"],
        tooltipPosition: "top",
      };
    case 29:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["05"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["06"] },
        ],
        targetId: "01",
        childTargetId: "01-node-footer-type",
        title: "Nodes - Node Footer",
        description: (
          <>
            <MarkdownRender text={"The next one indicates what type of node it is, this one is a concept node."} />
            <Stack direction={"row"} alignItems="center" spacing={"8px"} justifyContent={"space-around"} py="8px">
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
            </Stack>
          </>
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00", "01"],
      };
    case 30:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["05"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["06"] },
        ],
        targetId: "01",
        childTargetId: "01-node-footer-timestamp",
        title: "Nodes - Node Footer",
        description: <MarkdownRender text={"The third icon indicates how long ago the node was updated."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00", "01"],
      };
    case 31:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["05"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["06"] },
        ],
        targetId: "01",
        childTargetId: "01-node-footer-propose",
        title: "Nodes - Node Footer",
        description: (
          <MarkdownRender
            text={
              "The fourth one is the purpose/evaluate button. This allows you to edit the node or add child nodes to it."
            }
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00", "01"],
      };
    case 32:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["05"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["06"] },
        ],
        targetId: "01",
        childTargetId: "01-node-footer-votes",
        title: "Nodes - Node Footer",
        description: (
          <MarkdownRender
            text={
              "The next two icons are the downvote and upvote buttons, which also display each number of votes the node has received."
            }
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00", "01"],
      };
    case 33:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["05"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["06"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["07"] },
        ],
        targetId: "01",
        childTargetId: "01-node-footer-upvotes",
        title: "Nodes - Node Footer",
        description: (
          <MarkdownRender
            text={
              "Click the upvote button to signal the community that the current state of this node is so helpful that you'd like to lock it from further changes."
            }
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00", "01"],
        enableChildElements: ["01-node-footer-upvotes"],
        isClickeable: true,
      };
    case 34:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"],
            nodeChangeType: "added",
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "added",
            corrects: 2,
            correct: true,
          },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["05"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["06"] },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["07"],
            nodeChangeType: "added",
          },
        ],
        targetId: "07",
        childTargetId: "07-node-footer-downvotes",
        title: "Nodes - Node Footer",
        description: <MarkdownRender text={"A downvote is a vote to delete a node."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00", "01", "07"],
      };
    case 35:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", corrects: 2, correct: true },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["05"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["06"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["07"], nodeChangeType: "added", wrongs: 0 },
        ],
        targetId: "07",
        childTargetId: "07-node-footer-downvotes",
        title: "Nodes - Node Footer",
        description: (
          <MarkdownRender
            text={
              "Click the downvote button to vote for deleting the node. The node will be deleted, as soon as it gets more downvotes than upvotes (negative netvotes)."
            }
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00", "01", "07"],
        enableChildElements: ["07-node-footer-downvotes"],
        isClickeable: true,
      };
    case 36:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", corrects: 2, correct: true },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["05"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["06"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["07"], nodeChangeType: "removed" },
        ],
        targetId: "01",
        childTargetId: "01-node-footer-votes",
        title: "Nodes - Node Footer",
        description: (
          <MarkdownRender
            text={
              "The number of upvotes minus downvotes, called netvotes, determines how many or few approving votes a proposal needs in order to make the proposed changes to the node. This will be discussed further later on."
            }
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00", "01", "07"],
      };
    case 37:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added" },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "added",
            defaultOpenPart: null,
            corrects: 2,
            correct: true,
          },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["05"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["06"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["07"] },
        ],
        targetId: "01",
        childTargetId: "01-node-footer-tags-citations",
        title: "Nodes - Node Footer",
        description: (
          <MarkdownRender
            text={
              "The next icons are on a single button and represent the cited references and tags on the node. **Click** the button to expand."
            }
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00", "01"],
        enableChildElements: ["01-node-footer-tags-citations"],
        isClickeable: true,
      };

    case 38:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added" },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "added",
            defaultOpenPart: "References",
            corrects: 2,
            correct: true,
          },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["05"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["06"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["07"] },
        ],
        targetId: "01",
        childTargetId: "01-linking-words",
        title: "Nodes - Node Footer",
        description: (
          <MarkdownRender text={"You see the cited references listed on the left and the tags listed on the right."} />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00", "01"],
      };
    case 39:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added" },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "added",
            defaultOpenPart: "References",
            corrects: 2,
            correct: true,
          },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["05"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["06"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["07"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["08"] },
        ],
        targetId: "01",
        childTargetId: "01-reference-button-0",
        title: "Nodes - Node Footer",
        description: <MarkdownRender text={"Click the cited tag to open the corresponding node."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00", "01"],
        enableChildElements: ["01-reference-button-0"],
        isClickeable: true,
      };
    case 40:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added" },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "added",
            defaultOpenPart: "References",
            corrects: 2,
            correct: true,
          },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["05"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["06"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["07"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["08"], nodeChangeType: "added" },
        ],
        targetId: "01",
        childTargetId: "01-tag-button-0",
        title: "Nodes - Node Footer",
        description: <MarkdownRender text={"Click the cited tag to open the corresponding node."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00", "01"],
        enableChildElements: ["01-tag-button-0"],
        isClickeable: true,
      };

    case 41:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added" },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "added",
            defaultOpenPart: null,
            corrects: 2,
            correct: true,
          },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["05"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["06"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["07"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["08"], nodeChangeType: "modified" },
        ],
        targetId: "01",
        childTargetId: "01-button-parent-children",
        title: "Nodes - Node Footer",
        description: (
          <MarkdownRender text={"The next icon is for parent and child nodes. **Click** the button to expand. "} />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00", "01"],
        enableChildElements: ["01-button-parent-children"],
        isClickeable: true,
      };

    case 42:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added" },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "added",
            defaultOpenPart: "LinkingWords",
            corrects: 2,
            correct: true,
          },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["05"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["06"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["07"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["08"], nodeChangeType: "modified" },
        ],
        targetId: "01",
        childTargetId: "01-linking-words",
        title: "Nodes - Node Footer",
        description: (
          <MarkdownRender text={"You see the parent nodes listed on the left and child nodes listed on the right."} />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00", "01"],
      };
    case 43:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added" },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "added",
            defaultOpenPart: null,
            corrects: 2,
            correct: true,
          },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["05"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["06"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["07"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["08"], nodeChangeType: "modified" },
        ],
        targetId: "01",
        childTargetId: "01-node-footer-ellipsis",
        title: "Nodes - Node Footer",
        description: <MarkdownRender text={"Finally, click the ellipses button to open a few other options."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00", "01"],
        enableChildElements: ["01-node-footer-ellipsis"],
        isClickeable: true,
      };
    case 44:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added" },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "added",
            defaultOpenPart: null,
            corrects: 2,
            correct: true,
          },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["05"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["06"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["07"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["08"], nodeChangeType: "modified" },
        ],
        targetId: "01",
        childTargetId: "01-node-footer-ellipsis",
        title: "Nodes - Node Footer",
        description: <MarkdownRender text={"Click this button to have the node narrated for you."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00", "01"],
        enableChildElements: ["01-node-footer-ellipsis"],
      };
    case 45:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added" },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
            nodeChangeType: "added",
            defaultOpenPart: null,
            corrects: 2,
            correct: true,
          },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["05"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["06"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["07"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["08"], nodeChangeType: "modified" },
        ],
        targetId: "01",
        childTargetId: "01-node-footer-ellipsis",
        title: "Nodes - Node Footer",
        description: (
          <MarkdownRender
            text={
              "Finally, click this button to share the node on your Twitter, Reddit, Facebook, or Linkedin profiles."
            }
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00", "01"],
        enableChildElements: ["01-node-footer-ellipsis"],
      };
    default:
      return state;
  }
}
