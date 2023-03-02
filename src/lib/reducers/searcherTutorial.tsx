// import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
// import ShareIcon from "@mui/icons-material/Share";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { FullNodeData, NodeTutorialState, TutorialState } from "../../nodeBookTypes";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

dayjs.extend(relativeTime);

const DISABLE_NOTEBOOK_OPTIONS = [
  "TOOLBAR",
  "LIVENESS_BAR",
  "COMMUNITY_LEADERBOARD",
  "SCROLL_TO_NODE_BUTTON",
  "FOCUS_MODE_BUTTON",
  "SEARCHER_SIDEBAR",
];

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

  const tt: NodeTutorialState = {
    localSnapshot: [],
    targetId: "",
    title: "",
    description: null,
    // Description can be added in markdown in this way
    // <MarkdownRender text={"This node defines a node in\n\n\n```js\nconsole.log('sd')\n```\n1Cademy!"} />
    disabledElements: [],
    enableChildElements: [],
    anchor: "Portal",
    ...getStepsValues(step, max),
    tooltipPosition: "top",
    isClickeable: false,
    targetDelay: 0,
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
  "SearchIcon"
  "search-recently-input"
  "recentNodesList"
  "search-list"
 */

const NODES_STEPS: {
  localSnapshot: FullNodeData[];
  targetId: string;
  childTargetId?: string;
  title: string;
  description: React.ReactNode;
  disabledElements?: string[];
  enableChildElements?: string[];
  // anchor: string;
  // currentStepName: SetStepType;
  // nextStepName: SetStepType;
  // previosStepName: SetStepType;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
  // stepLenght: number;
  isClickeable?: boolean;
  delay?: number;
}[] = [
  {
    localSnapshot: [],
    targetId: "sidebar-wrapper-searcher",
    childTargetId: "sidebar-wrapper-searcher",
    title: "Search Engine",
    description: (
      <MarkdownRender
        text={"1Cademy has a search engine that can be used to help you find a node, reference, or topic."}
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS],
    enableChildElements: ["toolbar-search-button"],
    tooltipPosition: "right",
    delay: 450,
  },

  {
    localSnapshot: [],
    targetId: "sidebar-wrapper-searcher",
    childTargetId: "search-input",
    title: "Search Engine",
    description: <MarkdownRender text={"To search enter your query"} />,
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS],
    enableChildElements: ["search-input"],
    tooltipPosition: "bottom",
  },

  {
    localSnapshot: [],
    targetId: "sidebar-wrapper-searcher",
    childTargetId: "SearchIcon",
    title: "Search Engine",
    description: <MarkdownRender text={"**Click** on this search icon."} />,
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS],
    enableChildElements: ["SearchIcon"],
    tooltipPosition: "bottom",
    isClickeable: true,
  },
  {
    localSnapshot: [],
    targetId: "sidebar-wrapper-searcher",
    childTargetId: "searcher-sidebar-options",
    title: "Search Engine",
    description: <MarkdownRender text={"Beyond searching terms there are a number of ways to refine your search."} />,
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01"],
    enableChildElements: ["searcher-sidebar-options"],
    tooltipPosition: "right",
  },
  {
    localSnapshot: [],
    targetId: "sidebar-wrapper-searcher",
    childTargetId: "searcher-tags-button",
    title: "Search Engine",
    description: (
      <MarkdownRender
        text={
          "You can search by tags by clicking this icon and refining your search to one or more selected tags representing information domains and communities."
        }
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01"],
    enableChildElements: ["searcher-tags-button"],
    tooltipPosition: "right",
  },
  {
    localSnapshot: [],
    targetId: "sidebar-wrapper-searcher",
    childTargetId: "search-recently-input",
    title: "Search Engine",
    description: (
      <MarkdownRender text={"You can also refine your search by how recently nodes were created or edited."} />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01"],
    enableChildElements: ["search-recently-input"],
    tooltipPosition: "right",
  },
  {
    localSnapshot: [],
    targetId: "sidebar-wrapper-searcher",
    childTargetId: "recentNodesList",
    title: "Search Engine",
    description: (
      <MarkdownRender
        text={
          "Finally you can further sort by: last viewed, date modified, proposals, upvotes, downvotes, or net votes with this icon."
        }
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01"],
    enableChildElements: ["recentNodesList"],
    tooltipPosition: "right",
  },
  {
    localSnapshot: [],
    targetId: "sidebar-wrapper-searcher",
    childTargetId: "sidebar-wrapper-searcher-content",
    title: "Search Engine",
    description: (
      <MarkdownRender
        text={
          "After entering search terms, you can select one of the nodes that are retrieved in this list and it will take you to that node."
        }
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01"],
    enableChildElements: ["search-item"],
    tooltipPosition: "right",
  },
];

export const SEARCHER_STEPS_COMPLETE: NodeTutorialState[] = NODES_STEPS.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
