// import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
// import ShareIcon from "@mui/icons-material/Share";
import CodeIcon from "@mui/icons-material/Code";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
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
const STEPS_LENGHT = 200; // 65

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
      // element.style.outline = "none";
      element.classList.remove("tutorial-pulse");
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
        description: <MarkdownRender text={"This is the title."} />,
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
          <MarkdownRender text={"We want a title that is concise and accurately describes the information within."} />
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
        childTargetId: "01-node-title",
        title: "Introduction",
        description: (
          <MarkdownRender
            text={"This means that you need to consider if the title is duplicated or would likely be duplicated."}
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

    case 7:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        targetId: "01",
        childTargetId: "01-node-content",
        title: "Introduction",
        description: <MarkdownRender text={"This is the content."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01"],
      };

    case 8:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        targetId: "01",
        childTargetId: "01-node-content",
        title: "Introduction",
        description: <MarkdownRender text={"The content of a node describes what is stated in a title."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01"],
      };

    case 9:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        targetId: "01",
        childTargetId: "01-node-content",
        title: "Introduction",
        description: <MarkdownRender text={"We want the content to be clear, concise, and accurate."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01"],
      };

    case 10:
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

    case 11:
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

    case 12:
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

    case 13:
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

    case 14:
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
          <MarkdownRender
            text={`Here you can see the parent node is **${INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"].title}**`}
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01", "00"],
      };
    case 15:
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
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["02"],
            nodeChangeType: "removed",
            open: true,
          },
        ],
        targetId: "01",
        childTargetId: "01-children-list",
        title: "Basic Navigation - Children Nodes",
        description: <MarkdownRender text={'Click on the link for "Creating or Improving a node in 1Cademy"'} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01", "00"],
        isClickeable: true,
      };
    case 16:
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
            defaultOpenPart: null,
            open: true,
          },
        ],
        targetId: "02",
        childTargetId: "02-button-parent-children",
        title: "Basic Navigation - Children Nodes",
        description: (
          <MarkdownRender
            text={`Most nodes have children. After learning this node, you can expand your knowledge by learning its children. Click the same button to see the node’s children list.`}
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01", "00"],
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
        ],
        targetId: "02",
        childTargetId: "02-children-list",
        title: "Basic Navigation - Children Nodes",
        description: <MarkdownRender text={"You can see the children link(s) listed below in this panel."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01", "00"],
      };
    case 18:
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
        ],
        targetId: "02",
        childTargetId: "02-children-list",
        title: "Basic Navigation - Children Nodes",
        description: <MarkdownRender text={"Here you can see the child node for 1Cademy is:"} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01", "00"],
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
            defaultOpenPart: "LinkingWords",
          },
        ],
        targetId: "02",
        childTargetId: "02-child-button-02",
        title: "Basic Navigation - Parent Nodes",
        description: <MarkdownRender text={"Here you can see the child node for 1Cademy is:"} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01", "00"],
        enableChildElements: ["02-child-button-02"],
      };

    case 50:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"], nodeChangeType: "added" },
        ],
        targetId: "103",
        childTargetId: "103-node-header",
        title: "Nodes - Node Header",
        description: (
          <MarkdownRender
            text={"Node headers are one of the ways that you can manipulate what you see on the knowledge graph."}
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101", "102", "103"],
      };

    case 51:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"], nodeChangeType: "added" },
        ],
        targetId: "103",
        childTargetId: "103-node-header",
        title: "Nodes - Node Header",
        description: <MarkdownRender text={"In the header are three buttons."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101", "102", "103"],
      };

    case 52:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"], nodeChangeType: "added" },
        ],
        targetId: "103",
        childTargetId: "103-hiden-button",
        title: "Nodes - Node Header",
        description: (
          <MarkdownRender
            text={
              "This one, closes the node. Once again, it just removes it from your view, it does not delete the node from the platform."
            }
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101", "102", "103"],
        enableChildElements: ["103-hiden-button"],
        isClickeable: true,
      };

    case 53:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"] },
        ],
        targetId: "101",
        childTargetId: "101-hide-offsprings-button",
        title: "Nodes - Node Header",
        description: (
          <MarkdownRender text={"This one closes all the open children nodes of the node it is clicked on."} />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101", "102"],
        enableChildElements: ["101-hide-offsprings-button"],
        isClickeable: true,
      };

    case 54:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"] },
        ],
        targetId: "101",
        title: "Nodes - Node Header",
        description: <MarkdownRender text={"See the branches of children were all removed from view."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101"],
      };

    case 55:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"] },
        ],
        targetId: "101",
        childTargetId: "101-close-button",
        title: "Nodes - Node Header",
        description: (
          <MarkdownRender text={"This one minimizes the content in a node so only the title is displayed."} />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101"],
        enableChildElements: ["101-close-button"],
        isClickeable: true,
      };

    case 56:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"], nodeChangeType: "added", open: false },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"] },
        ],
        targetId: "101",
        childTargetId: "101-open-button",
        title: "Nodes - Node Header",
        description: (
          <MarkdownRender text={"This one maximize the content in a node so the title and content are displayed."} />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101"],
        enableChildElements: ["101-open-button"],
        isClickeable: true,
      };

    // -------------------- FOOTER
    case 57:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"] },
        ],
        targetId: "101",
        childTargetId: "101-node-footer",
        title: "Nodes - Node Footer",
        description: <MarkdownRender text={"The node footer provides many tools."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101"],
        tooltipPosition: "bottom",
      };
    case 58:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"] },
        ],
        targetId: "101",
        childTargetId: "101-node-footer-user",
        title: "Nodes - Node Footer",
        description: (
          <MarkdownRender
            text={
              "The first is the profile of the top contributor to the node. That is the person that has done the most to make the node in its present form."
            }
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101"],
        tooltipPosition: "bottom",
      };
    case 59:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"] },
        ],
        targetId: "101",
        childTargetId: "101-node-footer-type",
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
            </Stack>
          </>
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101"],
        tooltipPosition: "bottom",
      };
    case 60:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"] },
        ],
        targetId: "101",
        childTargetId: "101-node-footer-timestamp",
        title: "Nodes - Node Footer",
        description: <MarkdownRender text={"The third icon indicates how long ago the node was approved. "} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101"],
        tooltipPosition: "bottom",
      };
    case 61:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"] },
        ],
        targetId: "101",
        childTargetId: "101-node-footer-propose",
        title: "Nodes - Node Footer",
        description: (
          <MarkdownRender
            text={
              "The fourth icon is the purpose/evaluate versions of this node button.This allows you to edit the node or add child nodes to it."
            }
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101"],
        tooltipPosition: "bottom",
      };
    case 62:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"] },
        ],
        targetId: "101",
        childTargetId: "101-node-footer-votes",
        title: "Nodes - Node Footer",
        description: (
          <MarkdownRender
            text={
              "The next two icons are the downvote and upvote buttons, which also display each number of votes the node has received."
            }
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101"],
        tooltipPosition: "bottom",
      };
    case 63:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["104"] },
        ],
        targetId: "101",
        childTargetId: "101-node-footer-upvotes",
        title: "Nodes - Node Footer",
        description: (
          <MarkdownRender text={"An upvote is a vote to approve of the node’s contents and not change a node."} />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101"],
        enableChildElements: ["101-node-footer-upvotes"],
        tooltipPosition: "bottom",
        isClickeable: true,
      };
    case 64:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"],
            nodeChangeType: "added",
          },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"],
            nodeChangeType: "added",
            corrects: 2,
            correct: true,
          },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"] },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["104"],
            nodeChangeType: "added",
          },
        ],
        targetId: "104",
        childTargetId: "104-node-footer-downvotes",
        title: "Nodes - Node Footer",
        description: <MarkdownRender text={"A downvote is a vote to remove a node."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101", "104"],
        tooltipPosition: "bottom",
      };
    case 65:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"], nodeChangeType: "added", corrects: 2, correct: true },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["104"], nodeChangeType: "added", wrongs: 0 },
        ],
        targetId: "104",
        childTargetId: "104-node-footer-downvotes",
        title: "Nodes - Node Footer",
        description: (
          <MarkdownRender
            text={"When a node has a netvote of zero or has more downvotes than upvotes, the node will be deleted."}
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101", "104"],
        enableChildElements: ["104-node-footer-downvotes"],
        tooltipPosition: "bottom",
        isClickeable: true,
      };
    case 66:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"], nodeChangeType: "added", corrects: 2, correct: true },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["104"], nodeChangeType: "removed" },
        ],
        targetId: "101",
        childTargetId: "101-node-footer-votes",
        title: "Nodes - Node Footer",
        description: (
          <MarkdownRender
            text={
              "The difference of upvotes and downvotes, called net vote, also determines how many or few approving votes a proposal needs in order to change the contents of that node. This will be discussed further later on. "
            }
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101", "104"],
        tooltipPosition: "bottom",
      };
    case 67:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"], nodeChangeType: "added", corrects: 2, correct: true },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["104"] },
        ],
        targetId: "101",
        childTargetId: "101-node-footer-tags-citations",
        title: "Nodes - Node Footer",
        description: (
          <MarkdownRender
            text={"The next icons are on a single button and represent the tag and citation for a node"}
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101"],
      };
    case 68:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"], nodeChangeType: "added" },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"],
            nodeChangeType: "added",
            defaultOpenPart: null,
            corrects: 2,
            correct: true,
          },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["104"] },
        ],
        targetId: "101",
        childTargetId: "101-node-footer-tags-citations",
        title: "Nodes - Node Footer",
        description: <MarkdownRender text={"Click the button to expand."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101"],
        enableChildElements: ["101-node-footer-tags-citations"],
        isClickeable: true,
      };
    case 69:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"], nodeChangeType: "added" },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"],
            nodeChangeType: "added",
            defaultOpenPart: "References",
            corrects: 2,
            correct: true,
          },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["104"] },
        ],
        targetId: "101",
        childTargetId: "101-linking-words",
        title: "Nodes - Node Footer",
        description: (
          <MarkdownRender
            text={
              "You see the reference for the content of the node on the left and the tags for the node on the right."
            }
          />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101"],
      };
    case 70:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"], nodeChangeType: "added" },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"],
            nodeChangeType: "added",
            defaultOpenPart: null,
            corrects: 2,
            correct: true,
          },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["104"] },
        ],
        targetId: "101",
        childTargetId: "101-button-parent-children",
        title: "Nodes - Node Footer",
        description: <MarkdownRender text={"The next icon is for parent and child nodes. "} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101"],
      };
    case 71:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"], nodeChangeType: "added" },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"],
            nodeChangeType: "added",
            defaultOpenPart: null,
            corrects: 2,
            correct: true,
          },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["104"] },
        ],
        targetId: "101",
        childTargetId: "101-button-parent-children",
        title: "Nodes - Node Footer",
        description: <MarkdownRender text={"Click the button to expand."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101"],
        enableChildElements: ["101-button-parent-children"],
        isClickeable: true,
      };
    case 72:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"], nodeChangeType: "added" },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"],
            nodeChangeType: "added",
            defaultOpenPart: "LinkingWords",
            corrects: 2,
            correct: true,
          },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["104"] },
        ],
        targetId: "101",
        childTargetId: "101-linking-words",
        title: "Nodes - Node Footer",
        description: <MarkdownRender text={"You see the parent nodes on the left and child nodes on the right."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101"],
      };
    case 73:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"], nodeChangeType: "added" },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"],
            nodeChangeType: "added",
            defaultOpenPart: null,
            corrects: 2,
            correct: true,
          },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["104"] },
        ],
        targetId: "101",
        childTargetId: "101-node-footer-ellipsis",
        title: "Nodes - Node Footer",
        description: <MarkdownRender text={"Finally the ellipses icon can be clicked to open a few other options."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101"],
        enableChildElements: ["101-node-footer-ellipsis"],
      };
    case 74:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"], nodeChangeType: "added" },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"],
            nodeChangeType: "added",
            defaultOpenPart: null,
            corrects: 2,
            correct: true,
          },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["104"] },
        ],
        targetId: "101",
        childTargetId: "101-node-footer-ellipsis",
        title: "Nodes - Node Footer",
        description: <MarkdownRender text={"You can also have the node narrated for you."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101"],
        enableChildElements: ["101-node-footer-ellipsis"],
      };
    case 75:
      return {
        ...getBaseStepConfig(action.type),
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["100"], nodeChangeType: "added" },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["101"],
            nodeChangeType: "added",
            defaultOpenPart: null,
            corrects: 2,
            correct: true,
          },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["102"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["103"] },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["104"] },
        ],
        targetId: "101",
        childTargetId: "101-node-footer-ellipsis",
        title: "Nodes - Node Footer",
        description: (
          <MarkdownRender text={"Finally, you can share the node to Twitter, Reddit, Facebook, or Linkedin."} />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "100", "101"],
        enableChildElements: ["101-node-footer-ellipsis"],
      };
    default:
      return state;
  }
}
