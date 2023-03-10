import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { TutorialState, TutorialStep, TutorialStepConfig } from "src/nodeBookTypes";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

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

const TABLE_CONTENT_STEPS: TutorialStepConfig[] = [
  {
    title: "Table of Contents",
    targetId: "table-of-content-button",
    childTargetId: "table-of-content-button",
    description: (
      <MarkdownRender
        text={
          "Allows you to quickly navigate and access different sections of a tutorial by presenting a list of its contents."
        }
      />
    ),
    anchor: "Portal",
  },
];
const FOCUSED_VIEW_STEPS: TutorialStepConfig[] = [
  {
    title: "Focus View",
    targetId: "focused-view-button",
    childTargetId: "focused-view-button",
    description: (
      <MarkdownRender text={"Allows you to narrow their visual attention to a specific node on their screen."} />
    ),
    anchor: "Portal",
  },
];
const REDRAW_GRAPH_STEPS: TutorialStepConfig[] = [
  {
    title: "Redraw Graph",
    targetId: "redraw-graph-button",
    childTargetId: "redraw-graph-button",
    description: (
      <MarkdownRender text={"Allows you to refresh and update the hierarchical map of nodes in the graph."} />
    ),
    anchor: "Portal",
  },
];
const SCROLL_NODE_STEPS: TutorialStepConfig[] = [
  {
    title: "Scroll To Node",
    targetId: "scroll-to-node-button",
    childTargetId: "scroll-to-node-button",
    description: (
      <MarkdownRender text={"Allows you to quickly navigate to your selected node in the hierarchical map"} />
    ),
    anchor: "Portal",
  },
];

export const TABLE_CONTENT_STEPS_COMPLETE: TutorialStep[] = TABLE_CONTENT_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const FOCUSED_VIEW_STEPS_COMPLETE: TutorialStep[] = FOCUSED_VIEW_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const REDRAW_GRAPH_STEPS_COMPLETE: TutorialStep[] = REDRAW_GRAPH_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const SCROLL_NODE_STEPS_COMPLETE: TutorialStep[] = SCROLL_NODE_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
