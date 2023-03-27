import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { TutorialState, TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

const LEADER_BOARD_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    childTargetId: "toolbar-leaderboard-button",
    title: "Leader Board",
    description: (
      <MarkdownRender
        text={
          "This is the button for the leader board. Here you can filter how the leader board is displayed. You can choose to see the list weekly, monthly, or all time. You can also choose to see this list by all time or monthly, just based on other’s votes."
        }
      />
    ),
    tooltipPosition: "right",
    targetDelay: 450,
    anchor: "Portal",
    outline: "inside",
  },
  {
    childTargetId: "user-status-list",
    title: "Leader Board Result",
    description: (
      <MarkdownRender
        text={"Here you can see top users sorted by points, including information about their current online status."}
      />
    ),
    tooltipPosition: "right",
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
