import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const TMP_EDIT_NODE_CONFIG: TutorialStepConfig[] = [
  {
    title: "Propose Node - Edit Node",
    description: <MarkdownRender text={"**Click** on pencil button to enter in Edit Node."} />,
    childTargetId: "node-footer-propose",
    isClickeable: true,
  },
];

const TMP_PROPOSE_CHILD_CONCEPT_CONFIG: TutorialStepConfig[] = [
  {
    title: "Propose Child - Concept",
    description: (
      <MarkdownRender
        text={
          "To add a new **concept** node, you will propose an edit to the existing node that will serve as its parent node. It is important that you find a logical prerequisite to the node that you are adding. If there is not one, then you will need to build the necessary prerequisite node or nodes. Once you have a prerequisite, you will need to click this button. Instead of editing the node content, you will click the concept node icon on the right."
        }
      />
    ),
    childTargetId: "propose-concept-child",
    isClickeable: true,
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
    isClickeable: true,
  },
];

const TMP_PROPOSE_CHILD_REFERENCE_CONFIG: TutorialStepConfig[] = [
  {
    title: "Propose Child - Reference",
    description: <MarkdownRender text={"**Click** on reference icon button to create a new reference child."} />,
    childTargetId: "propose-reference-child",
    isClickeable: true,
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
    isClickeable: true,
    targetDelay: 500,
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
    isClickeable: true,
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
    isClickeable: true,
  },
];

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
