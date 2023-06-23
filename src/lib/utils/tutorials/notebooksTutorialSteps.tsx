import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const NOTEBOOKS_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    childTargetId: "toolbar-notebooks-button",
    title: "Notebooks",
    description: (
      <MarkdownRender
        text={
          "Here you can view your notebooks. A notebook is a 1Cademy graph with the nodes you have opened. It can be save and shared so you can access it later or let others see it. You can open different notebooks to view different arrangements of nodes without having a ton of nodes open at one time."
        }
      />
    ),
    tooltipPosition: "top",
    anchor: "Portal",
    outline: "inside",
  },
  {
    childTargetId: "toolbar-notebooks-button",
    title: "Notebooks options",
    description: (
      <MarkdownRender
        text={
          "Here you can see a list of the notebooks that you have saved and switch between them. Anytime you switch notebooks, the notebook your were previously on is saved here. You can also create new notebooks. The ellipsis next to each notebook allows you to rename, duplicate, or delete a notebook as well as copying a URL to the notebook so you can share it with others."
        }
      />
    ),
    tooltipPosition: "top",
    anchor: "Portal",
    outline: "inside",
  },
];

export const NOTEBOOKS_STEPS: TutorialStep[] = NOTEBOOKS_STEPS_CONFIG.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
