import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const PROPOSING_CONCEPT_EDIT: TutorialStepConfig[] = [
  {
    title: "Proposing Edits - Concept Node",
    description: (
      <MarkdownRender
        text={
          "Proposing an edit of **Concept Node** you will change the represented **idea** or **concept** of this node, wheter a **superordinate** or **subordinate** Concept"
        }
      />
    ),
  },
];

export const PROPOSING_CONCEPT_EDIT_COMPLETE: TutorialStep[] = PROPOSING_CONCEPT_EDIT.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
