import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const TMP_EDIT_NODE_CONFIG: TutorialStepConfig[] = [
  {
    title: "Propose Node - Edit Node",
    description: <MarkdownRender text={"**Click** on pencil button to enter in Edit Node"} />,
    childTargetId: "node-footer-propose",
    isClickeable: true,
  },
];

const TMP_PROPOSE_CHILD_CONCEPT_CONFIG: TutorialStepConfig[] = [
  {
    title: "Propose Child - Concept",
    description: <MarkdownRender text={"**Click** on concept icon button to create a new concept child"} />,
    childTargetId: "propose-concept-child",
    isClickeable: true,
  },
];

const TMP_PROPOSE_CHILD_RELATION_CONFIG: TutorialStepConfig[] = [
  {
    title: "Propose Child - Concept",
    description: <MarkdownRender text={"**Click** on concept icon button to create a new concept child"} />,
    childTargetId: "propose-relation-child",
    isClickeable: true,
  },
];

const TMP_PROPOSE_CHILD_QUESTION_CONFIG: TutorialStepConfig[] = [
  {
    title: "Propose Child - Concept",
    description: <MarkdownRender text={"**Click** on concept icon button to create a new concept child"} />,
    childTargetId: "propose-question-child",
    isClickeable: true,
  },
];

const TMP_PROPOSE_CHILD_CODE_CONFIG: TutorialStepConfig[] = [
  {
    title: "Propose Child - Concept",
    description: <MarkdownRender text={"**Click** on concept icon button to create a new concept child"} />,
    childTargetId: "propose-code-child",
    isClickeable: true,
  },
];

const TMP_PROPOSE_CHILD_REFERENCE_CONFIG: TutorialStepConfig[] = [
  {
    title: "Propose Child - Concept",
    description: <MarkdownRender text={"**Click** on concept icon button to create a new concept child"} />,
    childTargetId: "propose-reference-child",
    isClickeable: true,
  },
];

const TMP_PROPOSE_CHILD_IDEA_CONFIG: TutorialStepConfig[] = [
  {
    title: "Propose Child - Concept",
    description: <MarkdownRender text={"**Click** on concept icon button to create a new concept child"} />,
    childTargetId: "propose-idea-child",
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
