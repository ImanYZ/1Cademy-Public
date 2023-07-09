import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const PROPOSING_REFERENCE_EDIT: TutorialStepConfig[] = [
  {
    title: "Proposing Edits - Reference Node",
    description: (
      <MarkdownRender
        text={
          '**Reference** nodes are what you use to cite a source in other node types (with the exception of idea and reference nodes). In a reference node you just want the title of the source and its APA citation in the content. Page numbers, URLs, and time stamps are added when a reference node is cited by another node; they should not be added into individual reference nodes. You can edit the fields and then click the green "Propose" button at the bottom right.'
        }
      />
    ),
  },
];

export const PROPOSING_REFERENCE_EDIT_COMPLETE: TutorialStep[] = PROPOSING_REFERENCE_EDIT.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
