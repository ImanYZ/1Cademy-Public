import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const PROPOSING_RELATION_EDIT: TutorialStepConfig[] = [
  {
    title: "Proposing Edits - Relation Node",
    description: (
      <MarkdownRender
        text={
          "Proposing an edit to the **Relation Node** will affect multiple concepts identified within the node. It is important to note that the **Relation node** does not define these concepts."
        }
      />
    ),
  },
];

export const PROPOSING_RELATION_EDIT_COMPLETE: TutorialStep[] = PROPOSING_RELATION_EDIT.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
