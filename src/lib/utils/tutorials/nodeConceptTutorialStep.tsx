import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import ShareIcon from "@mui/icons-material/Share";
import { Stack } from "@mui/material";

import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const NODE_CONCEPT_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    title: "What is a Concept Node",
    description: (
      <Stack>
        <MarkdownRender text={"This is a **Concept** node. It can be distinguished by this icon here."} />
        <LocalLibraryIcon sx={{ alignSelf: "center" }} />
        <MarkdownRender text={"Concept nodes describe a single, discrete concept"} />
      </Stack>
    ),
    isClickeable: true,
  },
  {
    title: "Concept Node vs Relation Node",
    description: (
      <>
        <MarkdownRender
          text={
            "Concept and relation nodes are very common. While each Concept node defines/explains a unique concept, each Relation node explains the relationship between different Concept nodes, without defining/explaining any of them."
          }
        />
        <Stack direction={"row"} justifyContent={"center"} alignItems={"center"} spacing="32px">
          <LocalLibraryIcon />
          <ShareIcon />
        </Stack>
      </>
    ),
    isClickeable: true,
  },
];

export const NODE_CONCEPT: TutorialStep[] = NODE_CONCEPT_STEPS_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
