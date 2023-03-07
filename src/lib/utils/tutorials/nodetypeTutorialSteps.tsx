import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ShareIcon from "@mui/icons-material/Share";
import { Stack } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { TutorialState, TutorialStep, TutorialStepConfig } from "src/nodeBookTypes";

import MarkdownRender from "@/components/Markdown/Markdown_Proposed";

import { getBaseStepConfig } from "./tutorial.utils";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

dayjs.extend(relativeTime);

/**
EX: for notebook sections
 "TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD", "SCROLL_TO_NODE_BUTTON", "FOCUS_MODE_BUTTON"
Ex for Node id elements to disable
  "01-close-button",
  "01-open-button",
  "01-hide-offsprings-button",
  "01-hide-button",
  "01-node-footer-user",
  "01-node-footer-propose",
  "01-node-footer-downvotes",
  "01-node-footer-upvotes",
  "01-node-footer-tags-citations",
  "01-button-parent-children",
  "01-node-footer-ellipsis",
  "01-reference-button-0"
  "01-tag-button-0"
  "01-node-footer-menu"
  "SearchIcon"
  "search-recently-input"
  "recentNodesList"
  "search-list"
 */

const NODE_CONCEPT_STEPS: TutorialStepConfig[] = [
  {
    title: "What is a Concept Node",
    description: (
      <Stack>
        <MarkdownRender text={"This is a concept node. It can be distinguished by this icon here."} />
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
            "Concept and relation nodes are very common. While concept nodes define a single concept, relation nodes list several concepts but do not define them."
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
const NODE_RELATION_STEPS: TutorialStepConfig[] = [
  {
    title: "What is a Relation Node",
    description: (
      <Stack>
        <MarkdownRender text={"This is a relation node. It can be identified by this icon."} />
        <ShareIcon sx={{ alignSelf: "center" }} />
        <MarkdownRender
          text={
            "Relation nodes list concepts and help arrange the structure of information on a graph. The provide facets for groups of subordinate nodes to be linked to a superordinate node"
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
const NODE_REFERENCE_STEPS: TutorialStepConfig[] = [
  {
    title: "What is a Reference node",
    description: (
      <Stack>
        <MarkdownRender text={"This is a reference node. It can be identified by this icon. "} />
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
const NODE_QUESTION_STEPS: TutorialStepConfig[] = [
  {
    title: "What is a Question node",
    description: (
      <Stack>
        <MarkdownRender text={"This is a question node. It can be identified by this icon."} />
        <HelpOutlineIcon sx={{ alignSelf: "center" }} />
        <MarkdownRender
          text={"Question nodes contain multiple choice questions that are intended to help people study a topic."}
        />
      </Stack>
    ),
    isClickeable: true,
  },
];
console.log({ NODE_RELATION_STEPS, NODE_REFERENCE_STEPS, NODE_QUESTION_STEPS });
export const SEARCHER_STEPS_COMPLETE: TutorialStep[] = NODE_CONCEPT_STEPS.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
