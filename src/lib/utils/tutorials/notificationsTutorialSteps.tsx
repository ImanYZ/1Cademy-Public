import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

dayjs.extend(relativeTime);

const NOTIFICATIONS_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    // targetId: "notifications-tab-read",
    childTargetId: "notifications-tab-unread",
    title: "Unread Notifications",
    description: (
      <MarkdownRender
        text={
          "These are unread notifications. These are new notifications that you have not marked as read. In here you will receive notifications if a node you have made is edited or deleted. You also receive notifications if a proposal that you have made is accepted"
        }
      />
    ),
    tooltipPosition: "bottom",
    anchor: "Portal",
    outline: "inside",
  },
  {
    // targetId: "sidebar-wrapper-searcher",
    childTargetId: "notifications-tab-read",
    title: "Read Notification",
    description: (
      <MarkdownRender
        text={
          "This is a list of read notifications. These are all the notifications that you have received and marked as read."
        }
      />
    ),
    tooltipPosition: "bottom",
    anchor: "Portal",
    outline: "inside",
  },
  {
    childTargetId: "notifications-tab-requests",
    title: "Request Notifications",
    description: (
      <MarkdownRender
        text={
          "This is a list of request notifications. These are all the notifications that other user request access to your private notebooks."
        }
      />
    ),
    tooltipPosition: "bottom",
    anchor: "Portal",
    outline: "inside",
  },
];

export const NOTIFICATION_STEPS: TutorialStep[] = NOTIFICATIONS_STEPS_CONFIG.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
