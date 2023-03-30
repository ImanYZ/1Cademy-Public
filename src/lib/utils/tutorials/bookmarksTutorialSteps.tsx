import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

dayjs.extend(relativeTime);

const BOOKMARKS_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    childTargetId: "bookmarks-tab-updated",
    title: "Updated Bookmarks",
    description: (
      <MarkdownRender
        text={
          "Here is a list of updated bookmarked nodes. You can bookmark nodes to return to them. If these nodes have been edited, they will show up in this list."
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
          "Here is a list of studied nodes. If you bookmark a node and it has not been changed, then it will appear in this list."
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
