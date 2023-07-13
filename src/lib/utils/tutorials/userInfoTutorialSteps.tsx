import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { TutorialState, TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

dayjs.extend(relativeTime);

const USER_INFO_STEPS: TutorialStepConfig[] = [
  {
    childTargetId: "user-info-trends",
    title: "User Information",
    description: (
      <MarkdownRender
        text={
          "When you click another user's profile picture, you can see the history of their engagement, detailing their cumulative points across various node types as well as a complete inventory of proposals they've previously submitted."
        }
      />
    ),
    tooltipPosition: "bottom",
    anchor: "Portal",
    outline: "inside",
  },
  {
    childTargetId: "user-info-proposals",
    title: "Proposals History",
    description: (
      <MarkdownRender
        text={
          "Under this tab, you can find the list of all the proposals this user has submitted in chronological order. Clicking each of these proposals would navigate to the corresponding node in your current notebook. You can filter the list to show only proposals on specific node types."
        }
      />
    ),
    tooltipPosition: "bottom",
    anchor: "Portal",
    outline: "inside",
  },
];

export const USER_INFO_STEPS_COMPLETE: TutorialStep[] = USER_INFO_STEPS.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
