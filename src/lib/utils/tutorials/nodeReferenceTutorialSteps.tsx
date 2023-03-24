import MenuBookIcon from "@mui/icons-material/MenuBook";
import { Stack } from "@mui/material";

import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const NODE_REFERENCE_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    title: "What is a Reference node",
    description: (
      <Stack>
        <MarkdownRender text={"This is a **Reference** node. It can be identified by this icon. "} />
        <MenuBookIcon sx={{ alignSelf: "center" }} />
        <MarkdownRender
          text={
            "Reference nodes are used to link as a citation to other nodes. They contain the title of a source in the title and the full APA citation in the content. Do no include page number, time stamp, or URLs in reference nodes, these go in the citation of a node."
          }
        />
      </Stack>
    ),
    isClickeable: true,
  },
];

export const NODE_REFERENCE: TutorialStep[] = NODE_REFERENCE_STEPS_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
