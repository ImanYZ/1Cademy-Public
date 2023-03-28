import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const COMMUNITY_LEADER_BOARD_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    childTargetId: "ComLeaderboardMain",
    title: "Community Leader Board",
    description: (
      <MarkdownRender
        text={
          "This is the community leaderboard. It can be expanded to see which communities have received the most points. You can scroll this bar to see all communities. You can also filter how these are displayed. You can display the ranks by weekly, monthly, and all time. You can also display them based on self-votes, others’ votes all time, and others’ votes monthly."
        }
      />
    ),
    tooltipPosition: "top",
    anchor: "Portal",
    outline: "shallow",
  },
];

export const COMMUNITY_LEADER_BOARD_STEPS: TutorialStep[] = COMMUNITY_LEADER_BOARD_STEPS_CONFIG.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
