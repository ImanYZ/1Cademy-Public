// import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const NEXT_TUTORIAL_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    // childTargetId: "ComLeaderboardMain",
    title: "Would you like to proceed to the next tutorial?",
    description: null,
    // tooltipPosition: "top",
    // anchor: "Portal",
    // outline: "shallow",
    isNextTutorial: true,
  },
];

export const NEXT_TUTORIAL_STEPS: TutorialStep[] = NEXT_TUTORIAL_STEPS_CONFIG.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
