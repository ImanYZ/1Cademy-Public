import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const PROPOSING_CONCEPT_EDIT: TutorialStepConfig[] = [
  {
    title: "Proposing Edits - Concept Node",
    description: (
      <MarkdownRender
        text={
          'A **concept** node should define a single, descrete concept. So, if you can break down a concept node into multiple stand-alone nodes, we highly recommend you do that. You can make changes to the title, content, references, tags, node types, parents and children, and you can view proposed changes to the node on the side bar. To make your own edits, you just need to add edits to the fields you can change and then click the green "Propose" button at the bottom right.'
        }
      />
    ),
  },
];

export const PROPOSING_CONCEPT_EDIT_COMPLETE: TutorialStep[] = PROPOSING_CONCEPT_EDIT.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
