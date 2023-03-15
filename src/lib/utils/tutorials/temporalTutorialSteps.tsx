import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const TMP_EDIT_NODE_CONFIG: TutorialStepConfig[] = [
  {
    title: "Propose Node - Edit Node",
    description: <MarkdownRender text={"**Click** on pencil button to enter in Edit Node"} />,
    isClickeable: true,
  },
];

const TMP_PROPOSE_CHILD_CONCEPT_CONFIG: TutorialStepConfig[] = [
  {
    title: "Propose Child - Concept",
    description: <MarkdownRender text={"**Click** on concept icon button to create a new concept child"} />,
    isClickeable: true,
  },
];

export const TMP_EDIT_NODE: TutorialStep[] = TMP_EDIT_NODE_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});

export const TMP_PROPOSE_CHILD_CONCEPT: TutorialStep[] = TMP_PROPOSE_CHILD_CONCEPT_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
