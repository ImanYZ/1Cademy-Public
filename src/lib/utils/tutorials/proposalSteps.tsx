import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { FullNodeData, NodeTutorialState } from "../../../nodeBookTypes";
import { INTERACTIVE_TUTORIAL_NOTEBOOK_NODES } from "../interactiveTutorialNodes";
// import { FullNodeData, NodeTutorialState, TutorialState } from "../../nodeBookTypes";
// import { INTERACTIVE_TUTORIAL_NOTEBOOK_NODES } from "../utils/interactiveTutorialNodes";
import { getBaseStepConfig } from "./tutorial.utils";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

dayjs.extend(relativeTime);
// const STEPS_LENGHT = 47; // 65

const DISABLE_NOTEBOOK_OPTIONS = [
  "TOOLBAR",
  "SEARCHER",
  "LIVENESS_BAR",
  "COMMUNITY_LEADERBOARD",
  "SCROLL_TO_NODE_BUTTON",
  "FOCUS_MODE_BUTTON",
];

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
 */

const STEPS: {
  localSnapshot: FullNodeData[];
  targetId: string;
  childTargetId?: string;
  title: string;
  description: React.ReactNode;
  disabledElements?: string[];
  enableChildElements?: string[];
  isClickeable?: boolean;
}[] = [
  {
    // ...getBaseStepConfig(action.type),
    localSnapshot: [{ ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true }],
    targetId: "00",
    title: "Proposals: Overview",
    description: (
      <MarkdownRender text={"Most of what you will do on 1Cademy will revolve around making proposals to nodes."} />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
  },

  {
    // ...getBaseStepConfig(action.type),
    localSnapshot: [
      { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
      { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
    ],
    targetId: "01",
    childTargetId: "01-node-body",
    title: "Introduction",
    description: <MarkdownRender text={"Each node has a body that consists of a title and content."} />,
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "01"],
  },
];

export const PROPOSAL_STEPS_COMPLETE: NodeTutorialState[] = STEPS.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
