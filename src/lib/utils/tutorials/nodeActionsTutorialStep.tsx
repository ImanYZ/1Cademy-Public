import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { TutorialState, TutorialStepConfig } from "src/nodeBookTypes";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { getBaseStepConfig } from "./tutorial.utils";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

dayjs.extend(relativeTime);

const PARENT_CHILDREN_STEPS: TutorialStepConfig[] = [
  {
    title: "Parents",
    childTargetId: "parents-list",
    description: (
      <MarkdownRender
        text={
          "Here is a list of parent nodes. Parent nodes are superordinate concepts that provide prerequisite information for the current node."
        }
      />
    ),
  },
  {
    title: "Children",
    childTargetId: "children-list",
    description: (
      <MarkdownRender
        text={"This is the list of child nodes. It contains all the nodes that are subordinate to this node."}
      />
    ),
  },
];
const PARENT_STEPS: TutorialStepConfig[] = [
  {
    title: "Parent node",
    description: (
      <MarkdownRender
        text={"This is a parent node. It is a node containing information superordinate to the previous node."}
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
          "This is a child node. It is a single node containing information that is subordinate to the previous node."
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
          "This button allows you to upvote a node. An upvote serves to make a node more permanent. It raises the threshold of net votes a proposal needs to change a node, and makes it so more downvotes are needed to delete the node altogether."
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
    targetDelay: 500,
  },
];
const CLOSE_OPEN_STEPS: TutorialStepConfig[] = [
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

const OPEN_STEPS: TutorialStepConfig[] = [
  {
    title: "Expanding a Node",
    childTargetId: "open-button",
    description: (
      <MarkdownRender
        text={"This button allowew you to expand the node that has been closed and seel all of its content."}
      />
    ),
    isClickeable: true,
  },
];

const CLOSE_STEPS: TutorialStepConfig[] = [
  {
    title: "Closing a node",
    childTargetId: "close-button",
    description: (
      <MarkdownRender text={"this button allowes you to close a node so that only the title is displayed."} />
    ),
    isClickeable: true,
  },
];

export const PARENT_CHILDREN_STEPS_COMPLETE = PARENT_CHILDREN_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const PARENT_STEPS_COMPLETE = PARENT_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const CHILD_STEPS_COMPLETE = CHILD_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const REFERENCES_TAGS_STEPS_COMPLETE = REFERENCES_TAGS_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const TAG_NODE_STEPS_COMPLETE = TAG_NODE_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const UPTOVE_STEPS_COMPLETE = UPTOVE_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const DOWNVOTE_STEPS_COMPLETE = DOWNVOTE_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const HIDE_STEPS_COMPLETE = HIDE_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const HIDE_OFFSPRING_STEPS_COMPLETE = HIDE_OFFSPRING_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const CLOSE_STEPS_COMPLETE = CLOSE_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const OPEN_STEPS_COMPLETE = OPEN_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const CLOSE_OPEN_STEPS_COMPLETE = CLOSE_OPEN_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
