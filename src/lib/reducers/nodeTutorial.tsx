// import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
// import ShareIcon from "@mui/icons-material/Share";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { DispatchNodeTutorialAction, NodeTutorialState, SetStepType, TutorialState } from "../../nodeBookTypes";
import { INTERACTIVE_TUTORIAL_NOTEBOOK_NODES } from "../utils/interactiveTutorialNodes";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

dayjs.extend(relativeTime);
const STEPS_LENGHT = 13; // 65

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
            text={
              "For example, **“growth”** could be used in a number of titles in a number of subjects. Are we talking about an organism growing, a population growing, or economic growth? Make sure the title addresses what is specifically being discussed."
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
        childTargetId: "01-node-content",
        title: "Introduction",
        description: <MarkdownRender text={"This is the content."} />,
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
        description: <MarkdownRender text={"The content of a node describes what is stated in a title."} />,
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
        description: <MarkdownRender text={"We want the content to be clear, concise, and accurate."} />,
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
        childTargetId: "01-node-content-media",
        title: "Introduction",
        description: (
          <MarkdownRender text={"In addition to text, the content may include a small image or a short video."} />
        ),
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01"],
      };

    // --- BASIC NAVIGATION

    case 10:
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

    case 11:
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
        childTargetId: "01-parent-button-0",
        title: "Basic Navigation - Parent Nodes",
        description: <MarkdownRender text={"Click one of the links to move to the parent node."} />,
        disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01"],
        enableChildElements: ["01-parent-button-0"],
        isClickeable: true,
      };

    case 13:
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

    default:
      return state;
  }
}
