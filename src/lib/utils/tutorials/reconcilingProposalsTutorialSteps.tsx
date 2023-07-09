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

const RECONCILING_ACCEPTED_PROPOSALS_STEPS: TutorialStepConfig[] = [
  {
    title: "Reconciling Proposals",
    description: (
      <MarkdownRender
        text={
          "Instructors have the authority to propose child nodes and improvements on all nodes tagged by their respective courses. Similarly, students also have the ability to suggest child nodes and improvements, though their submissions must be reviewed by course instructors prior to sharing with the entire class. Researchers are also eligible to propose child nodes and suggest improvements. Their proposals would be accepted instantly only if the original node, where the proposal is submitted, holds a net vote of 2 or fewer, calculated by subtracting downvotes from upvotes. If the score exceeds this limit, their proposal would be placed in the pending proposals list for that node, waiting for the community members to review. Note that any improvement or child node proposal tagged with a specific course will remain in the pending proposals list of the original node until the course instructors evaluate and decide on the proposal."
        }
      />
    ),
  },

  {
    title: "Reconciling Proposals - Approval",
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
            "The proposal gets **Approved Automatically** then it will be implemented on the **Map**. Otherwise, it'll go to the **pending proposals** list of the node. Exceptions: 1) Only if you are an instructor of a course tagged on this node, all your proposals will be approved immediately and you won't need to worry about the number of votes on the node. 2) If a node has a course tag, regardlesss of its votes, all improvement and child proposals on this node require the instructor's approval."
          }
        />

        {/* <MarkdownRender text="$$ \frac{\text{Netvote}}{2} \geq 2 & : \text{Aproval Required} \\ \text{Netvote} \leq 2 & : \text{Automatically Aproved} $$" /> */}
      </Stack>
    ),
  },
];
const RECONCILING_NOT_ACCEPTED_PROPOSALS_STEPS: TutorialStepConfig[] = [
  // {
  //   targetId: "sidebar-wrapper-proposalst",
  //   childTargetId: "sidebar-wrapper-proposals",
  //   title: "Reconciling Proposals",
  //   description: (
  //     <MarkdownRender
  //       text={"Instructors have the authority to propose child nodes and improvements on all nodes linked to their respective courses. Similarly, students also have the ability to suggest child nodes and improvements, though their submissions must be reviewed by course instructors prior to sharing with the entire class. Researchers, in their capacity, are also eligible to propose child nodes and suggest improvements. Their proposals would be accepted instantly only if the original node, where the proposal is submitted, holds a net score of 2 or fewer, calculated by subtracting downvotes from upvotes. If the score exceeds this limit, their proposal would be placed in the pending list for that node, waiting for community members to review. It's important to note that any improvement or child node proposal tagged with a specific course will remain in the pending list of the original node until the course instructors evaluate and decide on the proposal."}
  //     />
  //   ),
  //   anchor: "Portal",
  //   tooltipPosition: "bottom",
  //   targetDelay: 300,
  // },

  {
    // targetId: "sidebar-wrapper-proposals",
    childTargetId: "sidebar-wrapper-proposals",
    title: "Reconciling Pending Proposals",
    description: (node: FullNodeData) => (
      <Stack spacing={"8px"}>
        <MarkdownRender text={"A proposal will go to the pending proposals list if:"} />
        <MarkdownRender
          text="$$\text{Proposal Net Vote} < \frac{\text{Node Net Vote}}{2}$$"
          sx={{ fontSize: "14px" }}
        />
        <Stack direction={"row"} alignItems="center">
          <MarkdownRender text="$$\text{Net Votes} = \text{Upvotes} $$" sx={{ fontSize: "14px" }} />
          <CheckIcon color="success" />
          <MarkdownRender text="$$ - $$" sx={{ fontSize: "14px" }} />
          <MarkdownRender text="$$\text{Downvotes}$$" sx={{ fontSize: "14px" }} />
          <CloseIcon color="error" />
        </Stack>

        <MarkdownRender text=" " sx={{ fontSize: "14px" }} />
        <Typography>
          For example, a proposal with <b>1</b> up-vote and <b>0</b> down-votes for this node with{" "}
          <b>{node.corrects}</b> up-vote{node.corrects > 1 && "s"} and <b>{node.wrongs}</b> down-vote
          {node.wrongs > 1 && "s"} will show up in this list because:
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
            "To, such a proposal will **NOT** get **implemented** and will go to the **pending proposals** list of the node."
          }
        />
      </Stack>
    ),
    anchor: "Portal",
    tooltipPosition: "bottom",
    targetDelay: 300,
  },
  {
    // targetId: "sidebar-wrapper-proposals",
    childTargetId: "sidebar-wrapper-proposals",
    title: "Approving Pending Proposals",
    description: (
      <Stack spacing={"16px"}>
        <MarkdownRender text={"As soon as:"} />
        <MarkdownRender
          text="$$\text{Proposal Net Votes} \geq \frac{\text{Node Net Votes}}{2}   $$"
          sx={{ alignSelf: "center" }}
        />
        <MarkdownRender
          text={
            "The proposal will be implemented in the **knowledge graph** and will be moved to the **apptoved proposals list**."
          }
        />
      </Stack>
    ),
    tooltipPosition: "bottom",

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
