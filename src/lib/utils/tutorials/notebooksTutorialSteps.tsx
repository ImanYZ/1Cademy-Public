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
          "The list of notebooks and its settings can be found here. It will only appear when you hover over the toolbar and click on the **Notebooks** button."
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
          "In the notebook list, you can select a notebook by clicking on it, and it will display all of its nodes. You have additional options available in the three dots button, such as rename, duplicate, copy link, and delete. Finally, to create a new notebook, click on **Create New**."
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
