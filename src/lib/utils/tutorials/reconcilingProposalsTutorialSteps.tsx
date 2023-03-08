import { Stack } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { TutorialState, TutorialStep, TutorialStepConfig } from "src/nodeBookTypes";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { getBaseStepConfig } from "./tutorial.utils";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

dayjs.extend(relativeTime);
// const STEPS_LENGHT = 47; // 65

/**
EX: for notebook sections
 "TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD", "SCROLL_TO_NODE_BUTTON", "FOCUS_MODE_BUTTON"
Ex for Node id elements to disable
  "01-close-button",
  "01-open-button",
  "01-hide-offsprings-button",
  "01-hide-button",
  "01-node-footer-user",
  "01-node-footer-propose",
  "01-node-footer-downvotes",
  "01-node-footer-upvotes",
  "01-node-footer-tags-citations",
  "01-button-parent-children",
  "01-node-footer-ellipsis",
  "01-reference-button-0"
  "01-tag-button-0"
  "01-node-footer-menu"
 */

const RECONCILING_ACCEPTED_PROPOSALS_STEPS: TutorialStepConfig[] = [
  {
    title: "Reconciling Proposals",
    description: (
      <MarkdownRender
        text={"Just because you have proposed a change, it does not mean that the change will be implemented."}
      />
    ),
  },

  {
    title: "Reconciling Proposals",
    description: (
      <Stack spacing={"16px"}>
        <MarkdownRender text={"If the node you are changing has:"} />
        {/* <MarkdownRender text="$$\text{Net Vote proposal} \geq \frac{\text{Net Vote Node}}{2} : \text{Aproved}$$" /> */}
        <MarkdownRender text="$$\text{Net Vote Node} \leq 2 $$" sx={{ alignSelf: "center" }} />
        <MarkdownRender
          text={
            "The proposal gets **Aproved Atomatically** then it will be implemented on the **Map** and will be moved to the accepted proposal list"
          }
        />

        {/* <MarkdownRender text="$$ \frac{\text{Netvote}}{2} \geq 2 & : \text{Aproval Required} \\ \text{Netvote} \leq 2 & : \text{Automatically Aproved} $$" /> */}
      </Stack>
    ),
  },
];
const RECONCILING_NOT_ACCEPTED_PROPOSALS_STEPS: TutorialStepConfig[] = [
  {
    title: "Reconciling Proposals",
    description: (
      <MarkdownRender
        text={"Just because you have proposed a change, it does not mean that the change will be implemented."}
      />
    ),
  },

  {
    title: "Reconciling Proposals",
    description: (
      <Stack spacing={"16px"}>
        <MarkdownRender text={"If the node you are changing has:"} />
        <MarkdownRender
          text="$$\text{Net Vote Proposal} < \frac{\text{Net Vote Node}}{2}   $$"
          sx={{ alignSelf: "center" }}
        />
        <MarkdownRender
          text={"The proposal does not get **Aproved** then it will go the **list of pending proposal**"}
        />
      </Stack>
    ),
  },
  {
    title: "Reconciling Proposals",
    description: (
      <Stack spacing={"16px"}>
        <MarkdownRender text={"As soon as:"} />
        <MarkdownRender
          text="$$\text{Net Vote Proposal} \geq \frac{\text{Net Vote Node}}{2}   $$"
          sx={{ alignSelf: "center" }}
        />
        <MarkdownRender
          text={"The proposal will be implemented on the **Map** and will be moved to the **accepted proposal list**."}
        />
      </Stack>
    ),
  },
];
export const RECONCILING_ACCEPTED_PROPOSALS_STEPS_COMPLETE: TutorialStep[] = RECONCILING_ACCEPTED_PROPOSALS_STEPS.map(
  (c, i, s) => {
    return {
      ...getBaseStepConfig(i + 1, s.length),
      ...c,
    };
  }
);
export const RECONCILING_NOT_ACCEPTED_PROPOSALS_STEPS_COMPLETE: TutorialStep[] =
  RECONCILING_NOT_ACCEPTED_PROPOSALS_STEPS.map((c, i, s) => {
    return {
      ...getBaseStepConfig(i + 1, s.length),
      ...c,
    };
  });
