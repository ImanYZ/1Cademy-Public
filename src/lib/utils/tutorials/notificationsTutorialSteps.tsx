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
          "These represent new or unread notifications. Notifications will be sent to you if any proposal you submitted receives a vote or approval. Additionally, you will be notified if a node you've contributed to is voted on or is deleted."
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
          "This list includes all the notifications that you have received and marked as read."
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
          "When other users seek access to your notebooks, the related notifications will be displayed under this tab."
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
