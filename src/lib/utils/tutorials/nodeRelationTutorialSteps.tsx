import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import ShareIcon from "@mui/icons-material/Share";
import { Stack } from "@mui/material";

import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const NODE_RELATION_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    title: "What is a Relation Node",
    description: (
      <Stack>
        <MarkdownRender text={"This is a **Relation** node. It can be identified by this icon."} />
        <ShareIcon sx={{ alignSelf: "center" }} />
        <MarkdownRender
          text={
            "A Relation explains the relationship between different Concept nodes, without defining/explaining any of them. For example, you can list a number of node titles to group them in a Relation node. Another example is a Relation node that compared/contrasts two or more nodes."
          }
        />
      </Stack>
    ),
    isClickeable: true,
  },
  {
    title: "Concept Node vs Relation Node",
    description: (
      <>
        <Stack direction={"row"} justifyContent={"center"} alignItems={"center"} spacing="32px">
          <LocalLibraryIcon />
          <ShareIcon />
        </Stack>
        <MarkdownRender
          text={
            "Relation nodes allow you to divide child nodes into thematic categories. This helps readers understand how information is related to a given node. They do not define those concepts because they are defined in their own individual concept nodes."
          }
        />
      </>
    ),
    isClickeable: true,
  },
];

export const NODE_RELATION: TutorialStep[] = NODE_RELATION_STEPS_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
