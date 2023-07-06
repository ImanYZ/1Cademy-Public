import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import ShareIcon from "@mui/icons-material/Share";
import { Stack, Typography } from "@mui/material";

import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { NodeTypeIconButton } from "./nodeTutorialSteps";
import { getBaseStepConfig } from "./tutorial.utils";

const NODE_CONCEPT_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    title: "What is a Concept Node?",
    description: (
      <Stack>
        <MarkdownRender text={"This is a **Concept** node. It can be distinguished by the following icon:"} />
        <NodeTypeIconButton sx={{ mb: "4px", alignSelf: "center" }}>
          <LocalLibraryIcon fontSize="small" />
        </NodeTypeIconButton>
        <MarkdownRender text={"Concept nodes describe a single, discrete concept."} />
      </Stack>
    ),
    isClickable: true,
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
        <Stack
          direction="row"
          flexWrap="wrap"
          justifyContent={"space-around"}
          alignItems="center"
          spacing="25px"
          sx={{ mt: "4px", fontSize: "13px" }}
        >
          <Stack alignItems={"center"}>
            <NodeTypeIconButton>
              <LocalLibraryIcon color="inherit" fontSize="small" />
            </NodeTypeIconButton>
            <Typography fontSize={"inherit"}>Concept</Typography>
          </Stack>
          <Stack alignItems={"center"}>
            <NodeTypeIconButton>
              <ShareIcon color="inherit" fontSize="small" />
            </NodeTypeIconButton>
            <Typography fontSize={"inherit"}>Relation</Typography>
          </Stack>
        </Stack>
      </>
    ),
    isClickable: true,
  },
];

export const NODE_CONCEPT: TutorialStep[] = NODE_CONCEPT_STEPS_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
