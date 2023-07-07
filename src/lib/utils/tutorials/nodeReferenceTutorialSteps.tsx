import MenuBookIcon from "@mui/icons-material/MenuBook";
import { Stack } from "@mui/material";

import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { NodeTypeIconButton } from "./nodeTutorialSteps";
import { getBaseStepConfig } from "./tutorial.utils";

const NODE_REFERENCE_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    title: "What is a Reference node",
    description: (
      <Stack>
        <MarkdownRender text={"This is a **Reference** node. It can be identified by this icon:"} />
        <NodeTypeIconButton sx={{ alignSelf: "center", my: "4px" }}>
          <MenuBookIcon fontSize="small" />
        </NodeTypeIconButton>
        <MarkdownRender
          text={
            "Reference nodes are used as a citation in other nodes. The title of a reference node is the title of the source and its content is the full APA citation of the source. Do no include page numbers, time stamps, or URLs in reference nodes. These should be included when citing a reference node in another node."
          }
        />
      </Stack>
    ),
    isClickable: true,
  },
];

export const NODE_REFERENCE: TutorialStep[] = NODE_REFERENCE_STEPS_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
