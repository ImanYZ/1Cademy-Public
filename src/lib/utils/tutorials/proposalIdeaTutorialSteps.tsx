import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const PROPOSING_IDEA_EDIT: TutorialStepConfig[] = [
  {
    title: "Proposing Edits - Idea Node",
    description: (
      <MarkdownRender
        text={
          "Proposing an edit to the **Idea Node** involves revising the content of the node to provide **constructive feedback** or suggest new directions for future research. Remember to be concise and clear in your feedback."
        }
      />
    ),
  },
];

export const PROPOSING_IDEA_EDIT_COMPLETE: TutorialStep[] = PROPOSING_IDEA_EDIT.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
