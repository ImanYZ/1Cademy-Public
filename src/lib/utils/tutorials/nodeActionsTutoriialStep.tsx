import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { TutorialState, TutorialStepConfig } from "src/nodeBookTypes";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

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

const UPTOVE_STEPS: TutorialStepConfig[] = [
  {
    title: "Upvoting",
    description: (
      <MarkdownRender
        text={
          "This button allows you upvote a node. An upvote serves to make a node more permanent. It raises the threshold of net votes a proposal needs to change a node, and makes it so more downvotes are needed to delete the node altogether."
        }
      />
    ),
    isClickeable: true,
  },
];
const DOWNVOTE_STEPS: TutorialStepConfig[] = [
  {
    title: "Dowvoting",
    description: (
      <MarkdownRender
        text={
          "This button allows you to downvote a node. A downvote serves to make a node more easily changed or deleted. It lowers the threshold of net votes a proposal needs to change a node. If there are more downvotes than upvotes on a node, it will be deleted."
        }
      />
    ),
    isClickeable: true,
  },
];
const HIDE_STEPS: TutorialStepConfig[] = [
  {
    title: "Hiding a Node",
    description: (
      <MarkdownRender
        text={
          "This button allows you to remove a node from your personalized view of the knowledge graph. This button does not delete or remove a node, it just hides it from view. This allows you to keep your map tidy and only display nodes of immediate interest."
        }
      />
    ),
    isClickeable: true,
  },
];
const HIDE_OFFSPRING_STEPS: TutorialStepConfig[] = [
  {
    title: "Hiding offspring",
    description: (
      <MarkdownRender
        text={
          "This button is like the hide node button but allows you to hide whole strings of nodes. By clicking this button you will hide all the displayed children of the node you are clicking on."
        }
      />
    ),
    isClickeable: true,
  },
];
const CLOSE_STEPS: TutorialStepConfig[] = [
  {
    title: "Closing a Node",
    description: (
      <MarkdownRender text={"This button allows you to close a node so that only the title is displayed."} />
    ),
    isClickeable: true,
  },
];
const EXPAND_STEPS: TutorialStepConfig[] = [
  {
    title: "Expanding a node",
    description: (
      <MarkdownRender
        text={"This button allows you to expand a node that has been closed and seel all of its content."}
      />
    ),
    isClickeable: true,
  },
];
console.log({ UPTOVE_STEPS, DOWNVOTE_STEPS, HIDE_STEPS, HIDE_OFFSPRING_STEPS, CLOSE_STEPS, EXPAND_STEPS });

// export const NODE_CONCEPT_COMPLETE: TutorialStep[] = NODE_CONCEPT_STEPS.map((c, i, s) => {
//   return { ...getBaseStepConfig(i + 1, s.length), ...c };
// });
// export const NODE_RELATION_COMPLETE: TutorialStep[] = NODE_RELATION_STEPS.map((c, i, s) => {
//   return { ...getBaseStepConfig(i + 1, s.length), ...c };
// });
// export const NODE_REFERENCE_COMPLETE: TutorialStep[] = NODE_REFERENCE_STEPS.map((c, i, s) => {
//   return { ...getBaseStepConfig(i + 1, s.length), ...c };
// });
// export const NODE_IDEA_COMPLETE: TutorialStep[] = NODE_IDEA_STEPS.map((c, i, s) => {
//   return { ...getBaseStepConfig(i + 1, s.length), ...c };
// });
// export const NODE_QUESTION_COMPLETE: TutorialStep[] = NODE_QUESTION_STEPS.map((c, i, s) => {
//   return { ...getBaseStepConfig(i + 1, s.length), ...c };
// });
// export const NODE_CODE_COMPLETE: TutorialStep[] = NODE_CODE_STEPS.map((c, i, s) => {
//   return { ...getBaseStepConfig(i + 1, s.length), ...c };
// });
