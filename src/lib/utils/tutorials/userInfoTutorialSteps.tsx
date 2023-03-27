import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { TutorialState, TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

dayjs.extend(relativeTime);

const USER_SETTINGS_STEPS: TutorialStepConfig[] = [
  {
    childTargetId: "user-info-nodes",
    title: "Nodes",
    description: (
      <MarkdownRender
        text={
          "Here you can see the number and which types of nodes that the user has made. This includes a graph of their proposals over time."
        }
      />
    ),
    tooltipPosition: "right",
    targetDelay: 450,
    anchor: "Portal",
    outline: "shallow",
  },
  {
    childTargetId: "user-settings-proposals",
    title: "Proposals",
    description: (
      <MarkdownRender
        text={"On this page you can click the proposals tab and view all their currently pending proposals."}
      />
    ),
    tooltipPosition: "right",
    targetDelay: 450,
    anchor: "Portal",
    outline: "shallow",
  },
];

export const USER_SETTINGS_STEPS_COMPLETE: TutorialStep[] = USER_SETTINGS_STEPS.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
