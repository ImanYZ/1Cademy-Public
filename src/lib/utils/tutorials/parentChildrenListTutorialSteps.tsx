import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const PARENTS_CHILDREN_LIST_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    childTargetId: "parents-list",
    title: "List Of Parents",
    description: (
      <MarkdownRender
        text={
          "Here is a list of parent nodes. Parent nodes are superordinate concepts that provide prerequisite information for the current node."
        }
      />
    ),
    tooltipPosition: "top",
    // anchor: "Portal",
    outline: "inside",
  },
  {
    childTargetId: "children-list",
    title: "List Of Children",
    description: (
      <MarkdownRender
        text={"This is the list of child nodes. It contains all the nodes that are subordinate to this node."}
      />
    ),
    tooltipPosition: "top",
    // anchor: "Portal",
    outline: "inside",
  },
];

export const PARENTS_CHILDREN_LIST_STEPS: TutorialStep[] = PARENTS_CHILDREN_LIST_STEPS_CONFIG.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
