import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { Divider, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FullNodeData, TutorialState, TutorialStep, TutorialStepConfig } from "src/nodeBookTypes";

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
    description: (node: FullNodeData) => (
      <Stack spacing={"8px"}>
        <MarkdownRender text={"If the node you are changing has:"} />
        {/* <MarkdownRender text="$$\text{upvotes} - \text{downvotes} \leq 2 $$" sx={{ alignSelf: "center" }} /> */}
        <Stack direction={"row"} justifyContent="center" alignItems={"center"} spacing={"8px"}>
          <Stack direction={"row"} alignItems="center">
            <Typography>Upvotes</Typography>
            <CheckIcon color="success" />
          </Stack>
          <MarkdownRender text="$$ - $$" />
          <Stack direction={"row"} alignItems="center">
            <Typography>Downvotes</Typography>
            <CloseIcon color="error" />
          </Stack>
          <MarkdownRender text="$$ \leq $$" />
          <Typography>2</Typography>
        </Stack>
        <MarkdownRender text={"In this case: "} sx={{ alignSelf: "flex-start" }} />
        <Stack direction={"row"} justifyContent="center" alignItems={"center"} spacing={"8px"}>
          <Stack direction={"row"} alignItems="center">
            <Typography>{node.corrects}</Typography>
            <CheckIcon color="success" />
          </Stack>
          <MarkdownRender text="$$ - $$" />
          <Stack direction={"row"} alignItems="center">
            <Typography>{node.wrongs}</Typography>
            <CloseIcon color="error" />
          </Stack>
          <MarkdownRender text="$$ = $$" />
          <Typography>{node.corrects - node.wrongs}</Typography>
        </Stack>
        <MarkdownRender
          text={
            "The proposal gets **Approved Atomatically** then it will be implemented on the **Map**. It'll go to the **pending proposals** list of the node."
          }
        />

        {/* <MarkdownRender text="$$ \frac{\text{Netvote}}{2} \geq 2 & : \text{Aproval Required} \\ \text{Netvote} \leq 2 & : \text{Automatically Aproved} $$" /> */}
      </Stack>
    ),
  },
];
const RECONCILING_NOT_ACCEPTED_PROPOSALS_STEPS: TutorialStepConfig[] = [
  {
    targetId: "sidebar-wrapper-proposalst",
    childTargetId: "sidebar-wrapper-proposals",
    title: "Reconciling Proposals",
    description: (
      <MarkdownRender
        text={"Just because you have proposed a change, it does not mean that the change will be implemented."}
      />
    ),
    anchor: "Portal",
    tooltipPosition: "right",
    targetDelay: 300,
  },

  {
    targetId: "sidebar-wrapper-proposals",
    childTargetId: "sidebar-wrapper-proposals",
    title: "Reconciling Proposals",
    description: (node: FullNodeData) => (
      <Stack spacing={"8px"}>
        <MarkdownRender text={"A proposal will go to the pending list if:"} />
        <MarkdownRender
          text="$$\text{Net Vote of Proposal} < \frac{\text{Net Vote of Node}}{2}$$"
          sx={{ fontSize: "14px" }}
        />
        <Stack direction={"row"} alignItems="center">
          <MarkdownRender text="$$\text{Net Vote} : \text{Upvotes} $$" sx={{ fontSize: "14px" }} />
          <CheckIcon color="success" />
          <MarkdownRender text="$$ - $$" sx={{ fontSize: "14px" }} />
          <MarkdownRender text="$$\text{Downvotes}$$" sx={{ fontSize: "14px" }} />
          <CloseIcon color="error" />
        </Stack>

        <MarkdownRender text=" " sx={{ fontSize: "14px" }} />
        <Typography>
          In this case, the proposal has <b>1</b> up-vote and <b>0</b> down-votes for a node with <b>{node.corrects}</b>{" "}
          up-vote{node.corrects > 1 && "s"} and <b>{node.wrongs}</b> down-vote
          {node.wrongs > 1 && "s"}
        </Typography>

        <Stack direction={"row"} alignItems="center" justifyContent={"center"} spacing="8px">
          <Stack direction={"row"} justifyContent="center" alignItems={"center"} spacing={"8px"}>
            <Stack direction={"row"} alignItems="center">
              <Typography>1</Typography>
              <CheckIcon color="success" />
            </Stack>
            <MarkdownRender text="$$ - $$" />
            <Stack direction={"row"} alignItems="center">
              <Typography>0</Typography>
              <CloseIcon color="error" />
            </Stack>
          </Stack>
          <MarkdownRender text={"$$ < $$"} />
          <Stack alignItems={"center"}>
            <Stack direction={"row"} justifyContent="center" alignItems={"center"} spacing={"8px"}>
              <Stack direction={"row"} alignItems="center">
                <Typography>{node.corrects}</Typography>
                <CheckIcon color="success" />
              </Stack>
              <MarkdownRender text="$$ - $$" />
              <Stack direction={"row"} alignItems="center">
                <Typography>{node.wrongs}</Typography>
                <CloseIcon color="error" />
              </Stack>
            </Stack>
            <Divider sx={{ alignSelf: "normal" }} />
            <Typography>2</Typography>
          </Stack>
        </Stack>

        <MarkdownRender
          text={
            "The proposal will **NOT** get **implemented**. It'll go to the **pending proposals** list of the node."
          }
        />
      </Stack>
    ),
    anchor: "Portal",
    tooltipPosition: "right",
    targetDelay: 300,
  },
  {
    targetId: "sidebar-wrapper-proposals",
    childTargetId: "sidebar-wrapper-proposals",
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
    tooltipPosition: "right",

    anchor: "Portal",
    targetDelay: 300,
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
