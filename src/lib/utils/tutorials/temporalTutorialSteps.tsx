import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { LEFT_OFFSET_NEW_CHILDREN_BUTTON, NODE_WIDTH } from "../Map.utils";
import { getBaseStepConfig } from "./tutorial.utils";

const TMP_OFFSET_TOP_CHILDREN_BUTTON = 50;

const TMP_OPEN_PARENT_CHILDREN_CONFIG: TutorialStepConfig[] = [
  {
    title: "Parents/Children List",
    description: <MarkdownRender text={"This button allows you to open parents and children list."} />,
    childTargetId: "button-parent-children",
    isClickable: true,
  },
];

const TMP_EDIT_NODE_CONFIG: TutorialStepConfig[] = [
  {
    title: "Propose Node - Edit Node",
    description: (
      <MarkdownRender
        text={
          "This button allows you to propose and evaluate child nodes and improvements to this node. By **clicking** this button, you can make changes to the title, content, references, tags, node type, parents, and children of the node. You can also view proposed changes to the node on the sidebar to evaluate them."
        }
      />
    ),
    childTargetId: "node-footer-propose",
    isClickable: true,
  },
];

const TMP_PROPOSE_CHILD_CONCEPT_CONFIG: TutorialStepConfig[] = [
  {
    title: "Propose a Child Node",
    description: (
      <MarkdownRender
        text={
          "To propose a child node, you should first identify the appropriate prerequisite; click the pencil (edit) button on the prerequisite node; click one of the buttons below depending on the type of the child node you'd like to propose; fill out the fields of the child node that gets created on the right; and finally click the Propose button."
        }
      />
    ),
    childTargetId: "propose-concept-child",
    isClickable: true,
    leftOffset: NODE_WIDTH + LEFT_OFFSET_NEW_CHILDREN_BUTTON,
    topOffset: TMP_OFFSET_TOP_CHILDREN_BUTTON,
  },
];

const TMP_PROPOSE_CHILD_RELATION_CONFIG: TutorialStepConfig[] = [
  {
    title: "Propose Child - Relation",
    description: (
      <MarkdownRender
        text={
          "Once you have a prerequisite node, you will need to click this button. Instead of editing the node content, you will **click** the relation node icon on the right."
        }
      />
    ),
    childTargetId: "propose-relation-child",
    isClickable: true,
    leftOffset: NODE_WIDTH + LEFT_OFFSET_NEW_CHILDREN_BUTTON,
    topOffset: TMP_OFFSET_TOP_CHILDREN_BUTTON,
  },
];

const TMP_PROPOSE_CHILD_REFERENCE_CONFIG: TutorialStepConfig[] = [
  {
    title: "Propose Child - Reference",
    description: (
      <MarkdownRender
        text={
          "Once you have a prerequisite, you will need to click this button. Instead of editing the node content, you will **click** the reference node icon on the right."
        }
      />
    ),
    childTargetId: "propose-reference-child",
    isClickable: true,
    leftOffset: NODE_WIDTH + LEFT_OFFSET_NEW_CHILDREN_BUTTON,
    topOffset: TMP_OFFSET_TOP_CHILDREN_BUTTON,
  },
];
const TMP_PROPOSE_CHILD_QUESTION_CONFIG: TutorialStepConfig[] = [
  {
    title: "Propose Child - Question",
    description: (
      <MarkdownRender
        text={
          "Once you have a prerequisite node, you will need to click this button. Instead of editing the node content, you will **click** the question node icon on the right."
        }
      />
    ),
    childTargetId: "propose-question-child",
    isClickable: true,
    // targetDelay: 500,
    leftOffset: NODE_WIDTH + LEFT_OFFSET_NEW_CHILDREN_BUTTON,
    topOffset: TMP_OFFSET_TOP_CHILDREN_BUTTON,
  },
];

const TMP_PROPOSE_CHILD_IDEA_CONFIG: TutorialStepConfig[] = [
  {
    title: "Propose Child - Idea",
    description: (
      <MarkdownRender
        text={
          "Once you have a prerequisite node, you will need to click this button. Instead of editing the node content, you will **click** the idea node icon on the right."
        }
      />
    ),
    childTargetId: "propose-idea-child",
    isClickable: true,
    leftOffset: NODE_WIDTH + LEFT_OFFSET_NEW_CHILDREN_BUTTON,
    topOffset: TMP_OFFSET_TOP_CHILDREN_BUTTON,
  },
];

const TMP_PROPOSE_CHILD_CODE_CONFIG: TutorialStepConfig[] = [
  {
    title: "Propose Child - Code",
    description: (
      <MarkdownRender
        text={
          "Once you have a prerequisite node, you will need to click this button. Instead of editing the node content, you will **click** the code node icon on the right."
        }
      />
    ),
    childTargetId: "propose-code-child",
    isClickable: true,
    leftOffset: NODE_WIDTH + LEFT_OFFSET_NEW_CHILDREN_BUTTON,
    topOffset: TMP_OFFSET_TOP_CHILDREN_BUTTON,
  },
];
const TMP_OPEN_TAGS_REFERENCES_CONFIG: TutorialStepConfig[] = [
  {
    title: "Tags and References",
    description: <MarkdownRender text={"This button allows you to open list of Tags and References of the Node"} />,
    childTargetId: "node-footer-tags-citations",
    isClickable: true,
  },
];

const TMP_PATHWAYS_CONFIG: TutorialStepConfig[] = [
  {
    title: "Learning Pathways",
    description: <MarkdownRender text={"For defining a pathway you may want to open Parents o Children"} />,
    isClickable: true,
  },
];

export const TMP_OPEN_PARENT_CHILDREN: TutorialStep[] = TMP_OPEN_PARENT_CHILDREN_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});

export const TMP_EDIT_NODE: TutorialStep[] = TMP_EDIT_NODE_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});

export const TMP_PROPOSE_CHILD_CONCEPT: TutorialStep[] = TMP_PROPOSE_CHILD_CONCEPT_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});

export const TMP_PROPOSE_CHILD_RELATION: TutorialStep[] = TMP_PROPOSE_CHILD_RELATION_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});

export const TMP_PROPOSE_CHILD_QUESTION: TutorialStep[] = TMP_PROPOSE_CHILD_QUESTION_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});

export const TMP_PROPOSE_CHILD_REFERENCE: TutorialStep[] = TMP_PROPOSE_CHILD_REFERENCE_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});

export const TMP_PROPOSE_CHILD_CODE: TutorialStep[] = TMP_PROPOSE_CHILD_CODE_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});

export const TMP_PROPOSE_CHILD_IDEA: TutorialStep[] = TMP_PROPOSE_CHILD_IDEA_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});

export const TMP_TAGS_REFERENCES: TutorialStep[] = TMP_OPEN_TAGS_REFERENCES_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const TMP_PATHWAYS: TutorialStep[] = TMP_PATHWAYS_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
