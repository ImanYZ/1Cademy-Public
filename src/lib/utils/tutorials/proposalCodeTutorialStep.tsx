import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const PROPOSING_CODE_EDIT: TutorialStepConfig[] = [
  {
    title: "Proposing Edits - Code Node",
    description: (
      <MarkdownRender
        text={
          "Proposing an edit to the **Code Node** involves making changes to the displayed code snippet of a specified programming language. This can include modifying existing code, adding new code, or removing existing code using the appropriate programming syntax."
        }
      />
    ),
  },
];

export const PROPOSING_CODE_EDIT_COMPLETE: TutorialStep[] = PROPOSING_CODE_EDIT.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
