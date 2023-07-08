import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const PROPOSING_QUESTION_EDIT: TutorialStepConfig[] = [
  {
    title: "Proposing Edits - Question Node",
    description: (
      <MarkdownRender
        text={
          'Instructors create **question** node to quiz their students about the parent node(s). It should be a multiple-choice question that can have more than one correct answer. You can edit the fields and then click the green "Propose" button at the bottom right.'
        }
      />
    ),
  },
];

export const PROPOSING_QUESTION_EDIT_COMPLETE: TutorialStep[] = PROPOSING_QUESTION_EDIT.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
