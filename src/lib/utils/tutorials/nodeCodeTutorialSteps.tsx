import CodeIcon from "@mui/icons-material/Code";
import { Stack } from "@mui/material";

import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const NODE_CODE_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    title: "What is a Code node",
    description: (
      <Stack>
        <MarkdownRender text={"This is a **Code** node. It can be identified by this icon."} />
        <CodeIcon sx={{ alignSelf: "center" }} />
        <MarkdownRender
          text={
            "Code nodes contain code snippets from a programming language including Python, R, HTML, and JavaScript."
          }
        />
      </Stack>
    ),
    isClickeable: true,
  },
];

export const NODE_CODE: TutorialStep[] = NODE_CODE_STEPS_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
