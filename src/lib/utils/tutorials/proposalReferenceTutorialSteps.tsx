import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const PROPOSING_REFERENCE_EDIT: TutorialStepConfig[] = [
  {
    title: "Proposing Edits - Reference Node",
    description: (
      <MarkdownRender
        text={
          "For a **reference** node, you will want to add the title of the work your are citing to the title field and the APA citation to the content field. You should not add page numbers, time stamps, or URLs in a reference node. To make your own edits, you just need to add edits to the fields you can change and then click the green propose button at the bottom right."
        }
      />
    ),
  },
];

export const PROPOSING_REFERENCE_EDIT_COMPLETE: TutorialStep[] = PROPOSING_REFERENCE_EDIT.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
