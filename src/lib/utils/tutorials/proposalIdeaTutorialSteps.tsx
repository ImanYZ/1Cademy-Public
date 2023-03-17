import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const PROPOSING_IDEA_EDIT: TutorialStepConfig[] = [
  {
    title: "Proposing Edits - Idea Node",
    description: (
      <MarkdownRender
        text={
          "For an **idea** node, you should add your own ideas that pertain to the previous node(s). This is where you can make suggestions for this area of the map or state some thoughts about how the information can be interpreted. Because these include your own ideas, you do not need to cite a reference. To make your own edits, you just need to add edits to the fields you can change and then click the green propose button at the bottom right."
        }
      />
    ),
  },
];

export const PROPOSING_IDEA_EDIT_COMPLETE: TutorialStep[] = PROPOSING_IDEA_EDIT.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
