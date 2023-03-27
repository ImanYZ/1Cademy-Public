import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { TutorialState, TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

dayjs.extend(relativeTime);

const PENDING_PROPOSALS_STEPS: TutorialStepConfig[] = [
  {
    childTargetId: "sidebar-wrapper-pending-list-content",
    title: "Pending Proposals",
    description: (
      <MarkdownRender
        text={
          "The pending proposals list displays all the pending proposals for the community you have selected as your community."
        }
      />
    ),
    tooltipPosition: "right",
    anchor: "Portal",
    outline: "inside",
  },
  {
    childTargetId: "sidebar-wrapper-pending-list-content",
    title: "Pending Proposals",
    description: (
      <MarkdownRender
        text={
          "You can click on any of the proposals to see the node that it is proposing to change. You can also upvote or downvote the proposal. This will help determine if the proposal is accepted or not."
        }
      />
    ),
    tooltipPosition: "right",
    anchor: "Portal",
    outline: "inside",
  },
];

export const PENDING_PROPOSALS_STEPS_COMPLETE: TutorialStep[] = PENDING_PROPOSALS_STEPS.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
