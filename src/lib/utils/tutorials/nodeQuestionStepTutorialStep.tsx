import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Stack } from "@mui/material";

import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const NODE_QUESTION_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    title: "What is a Question node",
    description: (
      <Stack>
        <MarkdownRender text={"This is a **Question** node. It can be identified by this icon."} />
        <HelpOutlineIcon sx={{ alignSelf: "center" }} />
        <MarkdownRender
          text={"Question nodes contain multiple choice questions that are intended to help people study a topic."}
        />
      </Stack>
    ),
    isClickeable: true,
  },
];

export const NODE_QUESTION: TutorialStep[] = NODE_QUESTION_STEPS_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
