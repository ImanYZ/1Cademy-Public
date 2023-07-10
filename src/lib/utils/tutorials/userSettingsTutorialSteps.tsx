import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { TutorialState, TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

dayjs.extend(relativeTime);

const USER_SETTINGS_STEPS: TutorialStepConfig[] = [
  {
    childTargetId: "user-settings-picture",
    title: "User Profile Picture",
    description: (
      <MarkdownRender
        text={
          "Your profile picture, displayed here, serves as a visual identifier for your contributions and earned reputation points across 1Cademy. You have the option to upload a new profile picture by navigating to the account tab on this sidebar."
        }
      />
    ),
    tooltipPosition: "bottom",
    targetDelay: 450,
    anchor: "Portal",
    outline: "shallow",
  },
  {
    childTargetId: "user-settings-username",
    title: "Username/Full name",
    description: (
      <MarkdownRender
        text={"On 1Cademy, your identity is defined by either your username or your full name, depending on your preference. You have the option to specify which of these identifiers is displayed throughout the platform. This can be accomplished by navigating to the account tab on this sidebar. Additionally, under the same account tab, you can make revisions to your username and full name at any time."}
      />
    ),

    tooltipPosition: "bottom",
    anchor: "Portal",
    outline: "shallow",
  },
  {
    childTargetId: "user-settings-statistics",
    title: "Total Votes Received",
    description: (
      <Stack spacing={"8px"}>
      <MarkdownRender
        text={"This displays the total number of votes of different types that you have received in the current community:"}
      />
      <CheckIcon color="success" />
      <Typography>: The number of upvotes you have earned in this community.</Typography>
      <CloseIcon color="error" />
      <Typography>: The number of downvotes you have received in this community.</Typography>
      </Stack>
    ),

    tooltipPosition: "bottom",
    anchor: "Portal",
    outline: "outside",
  },
  {
    childTargetId: "MiniUserPrifileInstitution",
    title: "Institution",
    description: <MarkdownRender text={"This displays the institution that you are affiliated with."} />,

    tooltipPosition: "bottom",
    anchor: "Portal",
    outline: "shallow",
  },
  {
    childTargetId: "user-settings-community-tag",
    title: "Community",
    description: (
      <MarkdownRender
        text={
          "This is your community tag. It is the default tag that will be given to any proposal you submit. This means that any new nodes you propose will have this tag. The community tag should correspond with the community you are working with or your current focus on 1Cademy. A community tag can also be a course or chapter of a course that you are studying."
        }
      />
    ),

    tooltipPosition: "bottom",
    anchor: "Portal",
    outline: "shallow",
  },

  {
    childTargetId: "user-settings-trends",
    title: "Trends",
    description: (
      <MarkdownRender
        text={"This tab allows you to keep track of the number of proposals you submitted over time in your community. It also displays the number of points you have earned for each node type in your community."}
      />
    ),

    tooltipPosition: "bottom",
    anchor: "Portal",
    outline: "inside",
  },
  {
    childTargetId: "user-settings-node-types",
    title: "Points by Node Types",
    description: (
      <MarkdownRender
        text={"This displays the total number of points that you have received, divided by the node type, in your community."}
      />
    ),

    tooltipPosition: "top",
    anchor: "Portal",
    outline: "shallow",
  },

  {
    childTargetId: "user-settings-proposals",
    title: "Proposals",
    description: <MarkdownRender text={"The proposals tab displays all the proposals that you have made, sorted chronologically. Clicking each proposal would navigate to the corresponding node in your notebook."} />,

    tooltipPosition: "bottom",
    anchor: "Portal",
    outline: "inside",
  },
  {
    childTargetId: "user-settings-account",
    title: "Account",
    description: (
      <MarkdownRender
        text={
          "The account tab allows you to make adjustments to your notebook (personalized map view). You can switch between light and dark mode, change background and visualization type, displaying your full name or username, and whether the nodes are clustered by tags or not."
        }
      />
    ),

    tooltipPosition: "bottom",
    anchor: "Portal",
    outline: "inside",
  },
];

export const USER_SETTINGS_STEPS_COMPLETE: TutorialStep[] = USER_SETTINGS_STEPS.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
