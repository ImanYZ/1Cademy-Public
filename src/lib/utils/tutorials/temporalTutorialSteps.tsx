import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const TMP_EDIT_NODE_CONFIG: TutorialStepConfig[] = [
  {
    title: "Propose Node - Edit Node",
    description: (
      <MarkdownRender
        text={
          "This button allows you to edit and evaluate this node. By **clicking** on this button you can make changes to the title, content, references, tags, note type, parents and children, and you can view proposed changes to the node on the side bar."
        }
      />
    ),
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
          "Once you have a prerequisite, you will need to click this button. Instead of editing the node content, you will **click** the concept node icon on the right."
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
    description: (
      <MarkdownRender
        text={
          "Once you have a prerequisite, you will need to click this button. Instead of editing the node content, you will **click** the reference node icon on the right."
        }
      />
    ),
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
