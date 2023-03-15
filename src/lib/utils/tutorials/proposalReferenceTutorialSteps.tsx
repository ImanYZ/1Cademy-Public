import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const PROPOSING_REFERENCE_EDIT: TutorialStepConfig[] = [
  {
    title: "Proposing Edits - Reference Node",
    description: (
      <MarkdownRender
        text={
          "Proposing an edit to the **Reference Node** involves adding, modifying, or deleting reference information, Note that purpose is to be cited in other types of nodes."
        }
      />
    ),
  },
];

export const PROPOSING_REFERENCE_EDIT_COMPLETE: TutorialStep[] = PROPOSING_REFERENCE_EDIT.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
