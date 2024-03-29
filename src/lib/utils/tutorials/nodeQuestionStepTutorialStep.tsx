import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Stack } from "@mui/material";

import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { NodeTypeIconButton } from "./nodeTutorialSteps";
import { getBaseStepConfig } from "./tutorial.utils";

const NODE_QUESTION_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    title: "What is a Question Node?",
    description: (
      <Stack>
        <MarkdownRender text={"This is a **Question** node. It can be identified by this icon:"} />
        <NodeTypeIconButton sx={{ alignSelf: "center", my: "4px" }}>
          <HelpOutlineIcon fontSize="small" />
        </NodeTypeIconButton>
        <MarkdownRender
          text={
            "Question nodes contain multiple choice questions that are intended to help people study a topic. If you have a question about a node, it should NOT be made into a question node."
          }
        />
      </Stack>
    ),
    isClickable: true,
  },
];

export const NODE_QUESTION: TutorialStep[] = NODE_QUESTION_STEPS_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
