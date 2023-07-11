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
    tooltipPosition: "bottom",
    anchor: "Portal",
    outline: "inside",
  },
  {
    childTargetId: "sidebar-wrapper-pending-list-content",
    title: "Pending Proposals",
    description: (
      <MarkdownRender
        text={
          "You can explore each of the pending proposals by clicking on them to reveal the node they suggest to modify. Once you've opened a proposal, you have the opportunity to assess its potential value by casting an upvote or downvote. The implementation of a proposal will be approved if it accumulates a net vote count that is greater than or equal to half the net votes of the associated node. Please be aware that if a proposal or its linked node carries a course tag, approval authority is exclusive to the course's instructors."
        }
      />
    ),
    tooltipPosition: "bottom",
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
