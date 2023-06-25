import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const LEADER_BOARD_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    childTargetId: "toolbar-leaderboard",
    title: "Leaderboard",
    description: (
      <MarkdownRender
        text={
          "The leaderboard and its settings can be found here. It will not appear until you hover over the toolbar and the options expand. Move your cursor over here to view the leaderboard. You can choose to view the weekly, monthly, and all time leaderboard. You can also adjust it to see the leaderboard based on all votes and only votes from others."
        }
      />
    ),
    tooltipPosition: "top",
    // targetDelay: 450,
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
    // targetDelay: 450,
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
