import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const PROPOSING_QUESTION_EDIT: TutorialStepConfig[] = [
  {
    title: "Proposing Edits - Question Node",
    description: (
      <MarkdownRender
        text={
          "Proposing an edit to the **Question Node**  involves modifying the content of a multiple-choice question and its answer options. This can include changing the wording of the question, adding or removing answer options, or adjusting the feedback given to the user after answering the question."
        }
      />
    ),
  },
];

export const PROPOSING_QUESTION_EDIT_COMPLETE: TutorialStep[] = PROPOSING_QUESTION_EDIT.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
