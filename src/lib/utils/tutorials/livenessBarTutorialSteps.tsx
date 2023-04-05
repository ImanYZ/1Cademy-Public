import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const INTERACTION_LIVENESS_BAR_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    childTargetId: "live-bar-interaction",
    title: "Interaction Liveness Bar",
    description: (
      <MarkdownRender
        text={
          "Displays everyone that has received **points** on 1Cademy in the past 24 hours. It ranks people by the most points they have received in that time period."
        }
      />
    ),
    tooltipPosition: "left",
    targetDelay: 450,
    anchor: "Portal",
    outline: "inside",
  },
];

const REPUTATION_LIVENESS_BAR_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    childTargetId: "live-bar-reputation",
    title: "Reputation Liveness Bar",
    description: (
      <MarkdownRender
        text={
          "Displays everyone that has received **reputation** on 1Cademy in the past 24 hours. It ranks people by the most points they have received in that time period."
        }
      />
    ),
    tooltipPosition: "top",
    targetDelay: 450,
    anchor: "Portal",
    outline: "inside",
  },
];

export const INTERACTION_LIVENESS_BAR_STEPS: TutorialStep[] = INTERACTION_LIVENESS_BAR_STEPS_CONFIG.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});

export const REPUTATION_LIVENESS_BAR_STEPS: TutorialStep[] = REPUTATION_LIVENESS_BAR_STEPS_CONFIG.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
