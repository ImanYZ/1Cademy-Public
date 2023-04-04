import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const LEADER_BOARD_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    childTargetId: "toolbar-leaderboard-button",
    title: "Leaderboard",
    description: (
      <MarkdownRender
        text={
          "This is the button for the Leaderboard. Here you can filter how the Leaderboard is displayed. You can choose to see the list weekly, monthly, or all time. You can also choose to see this list by all time or monthly, just based on other’s votes."
        }
      />
    ),
    tooltipPosition: "top",
    targetDelay: 450,
    anchor: "Portal",
    outline: "inside",
  },
  {
    childTargetId: "user-status-list",
    title: "Leaderboard Result",
    description: (
      <MarkdownRender
        text={"Here you can see top users sorted by points, including information about their current online status."}
      />
    ),
    tooltipPosition: "top",
    targetDelay: 450,
    anchor: "Portal",
    outline: "inside",
  },
];

export const LEADER_BOARD_STEPS: TutorialStep[] = LEADER_BOARD_STEPS_CONFIG.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
