import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

dayjs.extend(relativeTime);

const BOOKMARKS_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    childTargetId: "bookmarks-tab-updated",
    title: "Bookmarked Updates",
    description: (
      <MarkdownRender
        text={
          "If you wish to receive alerts for updates on specific nodes, simply bookmark them. Any modifications to these nodes will trigger a notification, visible under this tab. Clicking on each notification will direct you to the corresponding node in your current notebook, allowing you to view the updated version."
        }
      />
    ),
    tooltipPosition: "bottom",
    anchor: "Portal",
    outline: "inside",
  },
  {
    childTargetId: "bookmarks-tab-studied",
    title: "Studied Bookmarks",
    description: (
      <MarkdownRender
        text={
          "In your collection of bookmarked nodes, you may have categorized certain ones as 'Studied.' These nodes are then highlighted in yellow and will appear under this tab. Please note, if any of these nodes receive updates, they will no longer maintain their 'Studied' status. Consequently, their color will change to red, and they will be relocated from this tab to the 'Updated' tab."
        }
      />
    ),
    tooltipPosition: "bottom",
    anchor: "Portal",
    outline: "inside",
  },
];

export const BOOKMARKS_STEPS: TutorialStep[] = BOOKMARKS_STEPS_CONFIG.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
