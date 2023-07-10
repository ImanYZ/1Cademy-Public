import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const LEADER_BOARD_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    childTargetId: "toolbar-leaderboard",
    title: "Community Leaderboard",
    description: (
      <MarkdownRender
        text={
          "The leaderboard in this community is ranked according to each member's accumulated reputation points. To view the precise count of reputation points for any individual, simply hover your cursor over their name. Our leaderboard offers flexibility, allowing you to view rankings on a weekly, monthly, or all-time basis. Further customization options let you view rankings based on the total number of votes received, with an option to exclude self-votes, displaying only the votes received from fellow community members."
        }
      />
    ),
    tooltipPosition: "top",
    // targetDelay: 450,
    anchor: "Portal",
    outline: "inside",
  },
  // {
  //   childTargetId: "user-status-list",
  //   title: "Leaderboard Result",
  //   description: (
  //     <MarkdownRender
  //       text={"Here you can see top users sorted by points, including information about their current online status."}
  //     />
  //   ),
  //   tooltipPosition: "top",
  //   // targetDelay: 450,
  //   anchor: "Portal",
  //   outline: "inside",
  // },
];

export const LEADER_BOARD_STEPS: TutorialStep[] = LEADER_BOARD_STEPS_CONFIG.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
