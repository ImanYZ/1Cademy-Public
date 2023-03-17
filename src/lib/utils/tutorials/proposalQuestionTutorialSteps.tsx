import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const PROPOSING_QUESTION_EDIT: TutorialStepConfig[] = [
  {
    title: "Proposing Edits - Question Node",
    description: (
      <MarkdownRender
        text={
          "For a **question** node, you you will want to make a question to quiz someone about the information in the previous node (nodes). It should be a multiple choice question that can have more than one correct answer. To make your own edits, you just need to add edits to the fields you can change and then click the green propose button at the bottom right."
        }
      />
    ),
  },
];

export const PROPOSING_QUESTION_EDIT_COMPLETE: TutorialStep[] = PROPOSING_QUESTION_EDIT.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
