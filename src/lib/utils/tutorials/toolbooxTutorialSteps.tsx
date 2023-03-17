import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const TABLE_CONTENT_STEPS: TutorialStepConfig[] = [
  {
    title: "Tutorial Table of Contents",
    targetId: "node-footer-propose",
    childTargetId: "node-footer-propose",
    description: (
      <MarkdownRender
        text={
          "For reviewing the interactive and organized set of tutorials of each feature you will need to click this button."
        }
      />
    ),
    anchor: "Portal",
    isClickeable: true,
    targetDelay: 300,
  },
];

export const TABLE_CONTENT_STEPS_COMPLETE: TutorialStep[] = TABLE_CONTENT_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
