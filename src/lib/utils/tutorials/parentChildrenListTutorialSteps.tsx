import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const PARENTS_CHILDREN_LIST_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    childTargetId: "parents-list",
    title: "List of Parents",
    description: (
      <MarkdownRender
        text={
          "Here is the list of parent or superordinate nodes that provide prerequisite knowledge to learn the current node."
        }
      />
    ),
    tooltipPosition: "top",
    // anchor: "Portal",
    outline: "inside",
  },
  {
    childTargetId: "children-list",
    title: "List of Children",
    description: (
      <MarkdownRender
        text={"This is the list of child or subordinate nodes that one can learn after learning the current node."}
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
