import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import ShareIcon from "@mui/icons-material/Share";
import { Stack } from "@mui/material";

import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { NodeTypeIconButton } from "./nodeTutorialSteps";
import { getBaseStepConfig } from "./tutorial.utils";

const NODE_RELATION_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    title: "What is a Relation Node",
    description: (
      <Stack>
        <MarkdownRender text={"This is a **Relation** node. It can be identified by this icon:"} />
        <NodeTypeIconButton sx={{ alignSelf: "center", my: "4px" }}>
          <ShareIcon fontSize="small" />
        </NodeTypeIconButton>
        <MarkdownRender
          text={
            "A Relation node explains the relationship between different Concept nodes, without defining/explaining any of them. For example, you can list a number of node titles to group them in a Relation node. Another example is a Relation node that compares/contrasts two or more nodes."
          }
        />
      </Stack>
    ),
    isClickable: true,
  },
  {
    title: "Concept Node vs. Relation Node",
    description: (
      <>
        <Stack direction={"row"} justifyContent={"center"} alignItems={"center"} spacing="24px" mt="4px">
          <NodeTypeIconButton>
            <LocalLibraryIcon fontSize="small" />
          </NodeTypeIconButton>
          <NodeTypeIconButton>
            <ShareIcon fontSize="small" />
          </NodeTypeIconButton>
        </Stack>
        <MarkdownRender
          text={
            "Concept and relation nodes are very common. While each Concept node defines/explains a unique concept, each Relation node explains the relationship between different Concept nodes, without defining/explaining any of them."
          }
        />
      </>
    ),
    isClickable: true,
  },
];

export const NODE_RELATION: TutorialStep[] = NODE_RELATION_STEPS_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
