import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import { Stack } from "@mui/material";

import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { NodeTypeIconButton } from "./nodeTutorialSteps";
import { getBaseStepConfig } from "./tutorial.utils";

const NODE_IDEA_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    title: "What is an Idea Node?",
    description: (
      <Stack>
        <MarkdownRender text={"This is an **Idea** node. It can be identified by this icon:"} />
        <NodeTypeIconButton sx={{ alignSelf: "center", my: "4px" }}>
          <EmojiObjectsIcon fontSize="small" />
        </NodeTypeIconButton>
        <MarkdownRender
          text={
            "Idea nodes are used to state an idea like potential concepts to add or a conclusion drawn from a collection of nodes. They are the creator’s ideas and do not need any citations."
          }
        />
      </Stack>
    ),
    isClickable: true,
  },
];

export const NODE_IDEA: TutorialStep[] = NODE_IDEA_STEPS_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
