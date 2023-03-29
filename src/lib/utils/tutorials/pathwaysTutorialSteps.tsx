import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const PATHWAYS_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    title: "Pathways",
    description: <MarkdownRender text={"This is a pathway"} />,
    tooltipPosition: "top",
    outline: "inside",
  },
];

export const PATHWAYS_STEPS: TutorialStep[] = PATHWAYS_STEPS_CONFIG.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
