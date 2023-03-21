import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const TABLE_CONTENT_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    title: "Tutorial Table of Contents",
    childTargetId: "toolbox-table-of-contents",
    description: (
      <MarkdownRender
        text={
          "You can click this button to view a full list of the tutorials for 1Cademy. It indicates which ones you have and have not completed. You can click on any of the listed tutorials to take them again if you need a refresher on any of 1Cademy’s features."
        }
      />
    ),
    anchor: "Portal",
    isClickeable: true,
    targetDelay: 450,
    tooltipPosition: "bottom",
  },
];

const FOCUS_MODE_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    title: "Focus Mode",
    childTargetId: "toolbox-focus-mode",
    description: (
      <MarkdownRender
        text={
          "If you click this button it will change the presentation format. Rather than looking at a full graph of the nodes you have open, it will focus on one node at a time and prived a linear route of going to parent or child nodes one at a time."
        }
      />
    ),
    anchor: "Portal",
    isClickeable: true,
    targetDelay: 450,
    tooltipPosition: "bottom",
  },
];

export const TABLE_CONTENT_STEPS: TutorialStep[] = TABLE_CONTENT_STEPS_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});

export const FOCUS_MODE_STEPS: TutorialStep[] = FOCUS_MODE_STEPS_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
