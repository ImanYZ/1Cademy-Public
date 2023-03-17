import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const PROPOSING_CODE_EDIT: TutorialStepConfig[] = [
  {
    title: "Proposing Edits - Code Node",
    description: (
      <MarkdownRender
        text={
          "For a **code** node you will want to add a snippet of programming language code. Make sure that it is formatted correctly and that it includes the correct language name. To make your own edits, you just need to add edits to the fields you can change and then click the green propose button at the bottom right."
        }
      />
    ),
  },
];

export const PROPOSING_CODE_EDIT_COMPLETE: TutorialStep[] = PROPOSING_CODE_EDIT.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
