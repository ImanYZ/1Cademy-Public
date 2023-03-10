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

const PARENT_CHILDREN_STEPS: TutorialStepConfig[] = [
  {
    title: "Parent and Children",
    childTargetId: "button-parent-children",
    description: (
      <MarkdownRender
        text={
          "Here is a list of parent nodes and a list of child nodes for this node. Parent nodes are superordinate concepts that provide prerequisite information for the current node. Child nodes are subordinate nodes that provide more specific or advanced information on a topic."
        }
      />
    ),
    isClickeable: true,
  },
];
const PARENT_STEPS: TutorialStepConfig[] = [
  {
    title: "Parent node",
    description: (
      <MarkdownRender
        text={
          "This is a parent node. It is a single concept node or a relation node containing several concepts (of which the current node is included). Clicking on this item will open the node to the left side of the current node."
        }
      />
    ),
    isClickeable: true,
  },
];
const CHILD_STEPS: TutorialStepConfig[] = [
  {
    title: "Parent node",
    description: (
      <MarkdownRender
        text={
          "This is a child node. It is a single concept node or a relation node containing several concepts that are subordinate to the previous node. Clicking on this item will open the node to the right side of the current node."
        }
      />
    ),
    isClickeable: true,
  },
];
const REFERENCES_TAGS_STEPS: TutorialStepConfig[] = [
  {
    title: "List of References",
    childTargetId: "node-references",
    description: (
      <MarkdownRender
        text={
          "This is the list of references for this node. This displays the reference nodes (which contain information about source material) used to create this node."
        }
      />
    ),
    isClickeable: true,
  },
  {
    title: "List of Tags",
    childTargetId: "node-tags",
    description: (
      <MarkdownRender
        text={
          "This is the list of tags for this node. Default tags correspond with the community tag of the node creator by default. They show the various subject areas covered by a node."
        }
      />
    ),
    isClickeable: true,
  },
];
const TAG_NODE_STEPS: TutorialStepConfig[] = [
  {
    title: "List of References",
    childTargetId: "tag-node",
    description: (
      <MarkdownRender
        text={
          "To add a tag to a node you will want to have the node you are adding as a tag open. You can then click on the propose/evaluate versions of a node for the node you want to add the tag to. From there you will see a list of tags and the option to “Add an existing Tag.” When you click the “Add and existing Tag” button you can then click on the node you would like to add as a tag."
        }
      />
    ),
    isClickeable: true,
  },
];
const UPTOVE_STEPS: TutorialStepConfig[] = [
  {
    title: "Upvoting",
    childTargetId: "node-footer-upvotes",
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
    childTargetId: "node-footer-downvotes",
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
    childTargetId: "hide-button",
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
    childTargetId: "hide-offsprings-button",
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
    childTargetId: "close-button",
    description: (
      <MarkdownRender text={"This button allows you to close a node so that only the title is displayed."} />
    ),
    isClickeable: true,
  },
  {
    title: "Expanding a node",
    childTargetId: "open-button",
    description: (
      <MarkdownRender
        text={"This button allows you to expand a node that has been closed and seel all of its content."}
      />
    ),
    isClickeable: true,
  },
];
const EXPAND_STEPS: TutorialStepConfig[] = [];

// export const NODE_CONCEPT_COMPLETE: TutorialStep[] = NODE_CONCEPT_STEPS.map((c, i, s) => {
//   return { ...getBaseStepConfig(i + 1, s.length), ...c };
// });

export const PARENT_CHILDREN_STEPS_COMPLETE: TutorialStep[] = PARENT_CHILDREN_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const PARENT_STEPS_COMPLETE: TutorialStep[] = PARENT_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const CHILD_STEPS_COMPLETE: TutorialStep[] = CHILD_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const REFERENCES_TAGS_STEPS_COMPLETE: TutorialStep[] = REFERENCES_TAGS_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const TAG_NODE_STEPS_COMPLETE: TutorialStep[] = TAG_NODE_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const UPTOVE_STEPS_COMPLETE: TutorialStep[] = UPTOVE_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const DOWNVOTE_STEPS_COMPLETE: TutorialStep[] = DOWNVOTE_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const HIDE_STEPS_COMPLETE: TutorialStep[] = HIDE_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const HIDE_OFFSPRING_STEPS_COMPLETE: TutorialStep[] = HIDE_OFFSPRING_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const CLOSE_STEPS_COMPLETE: TutorialStep[] = CLOSE_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const EXPAND_STEPS_COMPLETE: TutorialStep[] = EXPAND_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
