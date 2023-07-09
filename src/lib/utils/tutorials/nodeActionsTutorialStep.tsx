import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { Typography } from "@mui/material";
import { Stack } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FullNodeData, TutorialState, TutorialStep, TutorialStepConfig } from "src/nodeBookTypes";

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
          "Here is the list of parent or superordinate nodes that provide prerequisite knowledge to learn the current node."
        }
      />
    ),
  },
  {
    title: "Children",
    childTargetId: "children-list",
    description: (
      <MarkdownRender
        text={"This is the list of child or subordinate nodes that one can learn after learning the current node."}
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
    isClickable: true,
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
    isClickable: true,
  },
];
const REFERENCES_TAGS_STEPS: TutorialStepConfig[] = [
  {
    title: "List of references",
    childTargetId: "node-references",
    description: (
      <MarkdownRender
        text={
          "This is the list of references cited on this node. Each reference node contains the information about source material used to create the current node."
        }
      />
    ),
    isClickable: true,
  },
  {
    title: "List of tags",
    childTargetId: "node-tags",
    description: (
      <MarkdownRender
        text={
          "This is the list of tags cited on this node. Each tag represents a community/course/chapter. The tags show the various subject areas covered by a node."
        }
      />
    ),
    isClickable: true,
  },
];
const TAG_NODE_STEPS: TutorialStepConfig[] = [
  {
    title: "List of references",
    childTargetId: "tag-node",
    description: (
      <MarkdownRender
        text={
          "To add a tag to a node you will want to have the node you are adding as a tag open. You can then click on the propose/evaluate versions of a node for the node you want to add the tag to. From there you will see a list of tags and the option to “Add an existing Tag.” When you click the “Add and existing Tag” button you can then click on the node you would like to add as a tag."
        }
      />
    ),
    isClickable: true,
  },
];
const UPTOVE_STEPS: TutorialStepConfig[] = [
  {
    title: "Upvoting",
    childTargetId: "node-footer-upvotes",
    description: (node: FullNodeData) => (
      <Stack>
        <Typography>
          You can <strong>upvote</strong> the node if you think it is so good that you don't like to see any changes to
          it. The node currently has {node.corrects}
          <CheckIcon fontSize="small" color="success" sx={{ verticalAlign: "text-top" }} />{" "}
          {node.corrects == 1 ? "" : "s"}. Your upvote will increase the count to {node.corrects + 1}
          <CheckIcon fontSize="small" color="success" sx={{ verticalAlign: "text-top" }} />, ensuring the quality of the
          node.
        </Typography>
        <Typography>
          The node will be locked and all new proposals to change it will go to its pending list for further review, if:
        </Typography>
        <MarkdownRender text={`${String.raw`$$\text{Upvotes} > \text{2}$$`}`} sx={{ my: "4px", alignSelf: "center" }} />
        <Typography>If you upvote it:</Typography>
        <MarkdownRender
          text={`$$${String.raw`\text{${node.corrects + 1}}`}${
            node.corrects + 1 > 2 ? " > " : " <= "
          }${String.raw`\text{2}`}$$`}
          sx={{ alignSelf: "center" }}
        />
        <Typography>
          {node.corrects + 1 > 2 ? "So, the node will be locked." : "So, the node won't be locked."}
        </Typography>
      </Stack>
    ),
    isClickable: true,
  },
];
const DOWNVOTE_STEPS: TutorialStepConfig[] = [
  {
    title: "Downvoting",
    childTargetId: "node-footer-downvotes",
    description: (node: FullNodeData) => (
      <Stack>
        <Typography>
          You can <strong>downvote</strong> the node if you think it is not helpful to anyone's learning. The node
          currently has {node.wrongs}
          <CloseIcon fontSize="small" color="error" sx={{ verticalAlign: "text-top" }} /> downvote
          {node.wrongs == 1 ? "" : "s"}. Your downvote will increase the count to {node.wrongs + 1}
          <CloseIcon fontSize="small" color="error" sx={{ verticalAlign: "text-top" }} />.
        </Typography>
        <Typography>The node will be removed if:</Typography>

        <MarkdownRender
          text={`${String.raw`$$\text{Downvotes} > \text{Upvotes}$$`}`}
          sx={{ my: "4px", alignSelf: "center" }}
        />
        <Typography>If you downvote it:</Typography>
        <MarkdownRender
          text={`$$${String.raw`\text{${node.wrongs + 1}}`}${
            node.wrongs + 1 > node.corrects ? " > " : " <= "
          }${String.raw`\text{${node.corrects}}`}$$`}
          sx={{ alignSelf: "center" }}
        />
        <Typography>
          {node.wrongs + 1 > node.corrects ? "So, the node will be deleted." : "So, the node won't be deleted."}
        </Typography>
      </Stack>
    ),
    isClickable: true,
  },
];
const HIDE_STEPS: TutorialStepConfig[] = [
  {
    title: "Hiding a Node",
    childTargetId: "hidden-button",
    description: (
      <MarkdownRender
        text={
          "This button allows you to remove the node from your current notebook (personalized view of the knowledge graph). This button does not delete or remove the node; it just hides it in your notebook. This allows you to keep your notebook tidy and only display nodes of immediate interest."
        }
      />
    ),
    isClickable: true,
    outline: "inside",
  },
];
const HIDE_OFFSPRING_STEPS: TutorialStepConfig[] = [
  {
    title: "Hiding Descendants",
    childTargetId: "hide-descendants-button",
    description: (
      <MarkdownRender
        text={
          "This button is like the hide node button, but allows you to hide all the descendents of the node. By clicking this button you will hide all the displayed children of the node, its grand children, and so on."
        }
      />
    ),
    isClickable: true,
    outline: "inside",
  },
];

const EXPAND_STEPS: TutorialStepConfig[] = [
  {
    title: "Expanding the Node",
    childTargetId: "open-button",
    description: (
      <MarkdownRender
        text={"This button allows you to expand the node that has been collapsed and see all of its content."}
      />
    ),
    isClickable: true,
    outline: "inside",
  },
];

const COLLAPSE_STEPS: TutorialStepConfig[] = [
  {
    title: "Collapsing the Node",
    childTargetId: "close-button",
    description: (
      <MarkdownRender text={"This button allows you to collapse the node so that only its title would be displayed."} />
    ),
    isClickable: true,
    outline: "inside",
  },
];

const TAGS_REFERENCES_STEPS: TutorialStepConfig[] = [
  {
    title: "List of References",
    childTargetId: "node-references",
    description: (
      <MarkdownRender
        text={
          "This is the list of references cited on this node. Each reference node contains the information about source material used to create the current node."
        }
      />
    ),
    isClickable: true,
    outline: "shallow",
  },
  {
    title: "List of Tags",
    childTargetId: "node-tags",
    description: (
      <MarkdownRender
        text={
          "This is the list of tags cited on this node. Each tag represents a community/course/chapter. The tags show the various subject areas covered by a node."
        }
      />
    ),
    isClickable: true,
    outline: "shallow",
  },
];

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
export const COLLAPSE_STEPS_COMPLETE: TutorialStep[] = COLLAPSE_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const EXPAND_STEPS_COMPLETE: TutorialStep[] = EXPAND_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const TAGS_REFERENCES_STEPS_COMPLETE: TutorialStep[] = TAGS_REFERENCES_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
