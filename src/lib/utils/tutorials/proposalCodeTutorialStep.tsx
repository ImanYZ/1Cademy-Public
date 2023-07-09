import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const PROPOSING_CODE_EDIT: TutorialStepConfig[] = [
  {
    title: "Proposing Edits - Code Node",
    description: (
      <MarkdownRender
        text={
          'In a **code** node you can add a programming code snippet encosed by three backticks (```). Right after the starting three backticks, add the language name. This will ensure that 1Cademy can interpret your code and color-code it to improve its readability. You can edit the fields and then click the green "Propose" button at the bottom right.'
        }
      />
    ),
  },
];

export const PROPOSING_CODE_EDIT_COMPLETE: TutorialStep[] = PROPOSING_CODE_EDIT.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
