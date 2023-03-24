import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const PROPOSING_RELATION_EDIT: TutorialStepConfig[] = [
  {
    title: "Proposing Edits - Relation Node",
    description: (
      <MarkdownRender
        text={
          "For a **relation** node, you will want to be sure that it includes several concepts that are not defined. To make your own edits, you just need to add edits to the fields you can change and then click the green propose button at the bottom right."
        }
      />
    ),
  },
];

export const PROPOSING_RELATION_EDIT_COMPLETE: TutorialStep[] = PROPOSING_RELATION_EDIT.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
