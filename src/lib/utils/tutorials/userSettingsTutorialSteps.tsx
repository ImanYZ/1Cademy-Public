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
    title: "User Picture",
    description: (
      <MarkdownRender
        text={
          "This is your user picture. This helps other people see that they are interacting with other real people around the world. You can click on your picture to upload a new picture from your device."
        }
      />
    ),
    tooltipPosition: "right",
    targetDelay: 450,
    anchor: "Portal",
    outline: "shallow",
  },
  {
    childTargetId: "MiniUserPrifileName",
    title: "Username",
    description: (
      <MarkdownRender
        text={"This is your username. If you need to change this, you can edit it on this page under the account tab."}
      />
    ),

    tooltipPosition: "right",
    anchor: "Portal",
    outline: "inside",
  },
  {
    childTargetId: "user-settings-community-tag",
    title: "Community",
    description: (
      <MarkdownRender
        text={
          "Here is the community description. It says the community that you are a part of. This will automatically tag any node you make with the community you have selected. You can change your active community by clicking on the community name. You will be prompted to search for and select a new community to choose as your active community if you do so."
        }
      />
    ),

    tooltipPosition: "right",
    anchor: "Portal",
    outline: "shallow",
  },
  {
    childTargetId: "MiniUserPrifileInstitution",
    title: "Univercity",
    description: <MarkdownRender text={"This displays the university that you are enrolled at."} />,

    tooltipPosition: "right",
    anchor: "Portal",
    outline: "inside",
  },
  {
    childTargetId: "user-settings-statistics",
    title: "Total Points",
    description: (
      <MarkdownRender
        text={"This displays the total number of points that you have received in the current community."}
      />
    ),

    tooltipPosition: "right",
    anchor: "Portal",
    outline: "inside",
  },
  {
    childTargetId: "user-settings-node-types",
    title: "Points by Node Types",
    description: (
      <MarkdownRender
        text={"This displays the total number of points that you have received in the current community."}
      />
    ),

    tooltipPosition: "right",
    anchor: "Portal",
    outline: "inside",
  },
  {
    childTargetId: "user-settings-account",
    title: "Account",
    description: (
      <MarkdownRender
        text={
          "The account tab allows you to make adjustments to your personal view of the 1Cademy. You can switch between light and dark mode, change background and graph display, whether your name is displayed or not, and whether the nodes are clustered by tags or not."
        }
      />
    ),

    tooltipPosition: "right",
    anchor: "Portal",
    outline: "inside",
  },
  {
    childTargetId: "user-settings-personal",
    title: "Personal",
    description: <MarkdownRender text={"Personal tab is where you can update your personal information."} />,

    tooltipPosition: "right",
    anchor: "Portal",
    outline: "inside",
  },
  {
    childTargetId: "user-settings-professional",
    title: "Professional",
    description: (
      <MarkdownRender text={"The professional tab lets you update information about your occupation and education."} />
    ),

    tooltipPosition: "right",
    anchor: "Portal",
    outline: "inside",
  },
  {
    childTargetId: "user-settings-proposals",
    title: "Proposals",
    description: <MarkdownRender text={"The proposals tab displays all the proposals that you have made."} />,

    tooltipPosition: "right",
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
