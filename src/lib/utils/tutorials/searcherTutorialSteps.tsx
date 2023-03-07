// import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
// import ShareIcon from "@mui/icons-material/Share";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { TutorialState, TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

dayjs.extend(relativeTime);

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

const NODES_STEPS: TutorialStepConfig[] = [
  {
    targetId: "sidebar-wrapper-searcher",
    childTargetId: "sidebar-wrapper-searcher",
    title: "Search Engine",
    description: (
      <MarkdownRender
        text={"1Cademy has a search engine that can be used to help you find a node, reference, or topic."}
      />
    ),

    tooltipPosition: "right",
    targetDelay: 450,
    anchor: "Portal",
  },

  {
    targetId: "sidebar-wrapper-searcher",
    childTargetId: "search-input",
    title: "Search Engine",
    description: <MarkdownRender text={"To search enter your query"} />,
    tooltipPosition: "bottom",
    anchor: "Portal",
  },

  {
    targetId: "sidebar-wrapper-searcher",
    childTargetId: "SearchIcon",
    title: "Search Engine",
    description: <MarkdownRender text={"**Click** on this search icon."} />,
    tooltipPosition: "bottom",
    isClickeable: true,
    anchor: "Portal",
  },
  {
    targetId: "sidebar-wrapper-searcher",
    childTargetId: "searcher-sidebar-options",
    title: "Search Engine",
    description: <MarkdownRender text={"Beyond searching terms there are a number of ways to refine your search."} />,
    tooltipPosition: "right",
    anchor: "Portal",
  },
  {
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

    tooltipPosition: "right",
    anchor: "Portal",
  },
  {
    targetId: "sidebar-wrapper-searcher",
    childTargetId: "search-recently-input",
    title: "Search Engine",
    description: (
      <MarkdownRender text={"You can also refine your search by how recently nodes were created or edited."} />
    ),
    tooltipPosition: "right",
    anchor: "Portal",
  },
  {
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

    tooltipPosition: "right",
    anchor: "Portal",
  },
  {
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
    tooltipPosition: "right",
    anchor: "Portal",
  },
];

export const SEARCHER_STEPS_COMPLETE: TutorialStep[] = NODES_STEPS.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
