import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { NodeTutorialState, StepTutorialBase, TutorialState } from "../../../nodeBookTypes";
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

const OVERVIEW_STEPS: StepTutorialBase[] = [
  {
    localSnapshot: [{ ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "modified", open: true }],
    targetId: "00",
    title: "Proposals: Overview",
    description: (
      <MarkdownRender text={"Most of what you will do on 1Cademy will revolve around making proposals to nodes."} />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    targetDefaultProperties: { editable: true },
  },
  {
    localSnapshot: [{ ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "modified", open: true }],
    targetId: "00",
    title: "Proposals: Overview",
    description: (
      <MarkdownRender text={"You will need to propose a change to a node in order to add or edit content."} />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    targetDefaultProperties: { editable: true },
  },
  {
    localSnapshot: [{ ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "modified", open: true }],
    targetId: "00",
    childTargetId: "00_childNodes",
    title: "Proposals: Overview",
    description: (
      <MarkdownRender
        text={
          "You will also have the option to add any of the six types of children nodes which are listed along the right side."
        }
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    targetDefaultProperties: { editable: false },
  },
  {
    localSnapshot: [{ ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "modified", open: true }],
    targetId: "00",
    title: "Proposals: Overview",
    description: (
      <MarkdownRender
        text={
          "It is very important to know that new nodes are always added as a proposed change to an existing node which is the default parent node of the one being created."
        }
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    targetDefaultProperties: { editable: true },
  },
];

const FINDING_PREREQUISITES_STEPS: StepTutorialBase[] = [
  {
    localSnapshot: [
      { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true, editable: false },
    ],
    targetId: "00",
    title: "Proposals: Proposing Edits",
    description: (
      <MarkdownRender
        text={
          "Because new nodes are the children of a node you are editing, an important first step is to determine which node you will be attaching it to."
        }
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
  },
  {
    localSnapshot: [
      { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true, editable: true },
    ],
    targetId: "00",
    title: "Proposals: Proposing Edits",
    description: (
      <MarkdownRender
        text={
          "Nodes on 1Cademy represent branches of hierarchical relationships where a user will need to know the first concept to understand the concepts linked as children."
        }
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
  },
  {
    localSnapshot: [
      { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true, editable: true },
    ],
    targetId: "00",
    title: "Proposals: Proposing Edits",
    description: (
      <MarkdownRender
        text={
          "Therefore, you need to know the foundational information before you can understand new information. For example, you need to learn how to count before you can learn to add. "
        }
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
  },
  {
    localSnapshot: [
      { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true, editable: true },
    ],
    targetId: "00",
    title: "Proposals: Proposing Edits",
    description: (
      <MarkdownRender
        text={
          "When you want to add new content to 1Cademy you need to determine what prerequisite information is required and add your nodes onto the correct prerequisite. If it does not exist then you will need to add it first and link it to the best prerequisite related to what you are adding."
        }
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
  },
  {
    localSnapshot: [
      { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true, editable: true },
    ],
    targetId: "00",
    childTargetId: "toolbar-search-button",
    title: "Proposals: Proposing Edits",
    description: (
      <MarkdownRender
        text={"In order to see if the prerequisite already exists, you can use the search feature on the toolbar."}
      />
    ),
    tooltipPosition: "right",
    anchor: "Portal",
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
  },
  {
    localSnapshot: [
      { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true, editable: true },
    ],
    targetId: "00",
    title: "Proposals: Proposing Edits",
    description: (
      <MarkdownRender
        text={
          "You can also manually search through an area of nodes by opening children and parent nodes to find the correct branch of information where you would like to add your nodes."
        }
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
  },
  {
    localSnapshot: [
      { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true, editable: true },
    ],
    targetId: "00",
    title: "Proposals: Proposing Edits",
    description: (
      <MarkdownRender
        text={"Sometimes you will need to build the branch of nodes leading to the information you intend on adding."}
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
  },
];

const PROPOSING_EDITS_STEPS: StepTutorialBase[] = [
  {
    localSnapshot: [
      { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true, editable: true },
    ],
    targetId: "00",
    childTargetId: "00-node-body",
    title: "Proposals: Proposing Edits",
    description: <MarkdownRender text={"Try changing the title and content."} />,
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
  },
  {
    localSnapshot: [
      { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true, editable: true },
    ],
    targetId: "00",
    childTargetId: "00-node-type-selector",
    title: "Proposals: Proposing Edits",
    description: <MarkdownRender text={"You can also change the type of node here."} />,
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
  },
  {
    localSnapshot: [
      {
        ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"],
        nodeChangeType: "added",
        open: true,
        editable: true,
        defaultOpenPart: "References",
      },
    ],
    targetId: "00",
    childTargetId: "00-node-references",
    title: "Proposals: Proposing Edits",
    description: <MarkdownRender text={"You can add and remove citations."} />,
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
  },
  {
    localSnapshot: [
      {
        ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"],
        nodeChangeType: "added",
        open: true,
        editable: true,
        defaultOpenPart: "References",
      },
    ],
    targetId: "00",
    childTargetId: "00-node-tags",
    title: "Proposals: Proposing Edits",
    description: <MarkdownRender text={"Add or remove tags here."} />,
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
  },
  {
    localSnapshot: [
      {
        ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"],
        nodeChangeType: "added",
        open: true,
        editable: true,
        defaultOpenPart: null,
      },
    ],
    targetId: "00",
    childTargetId: "00-button-parent-children",
    title: "Proposals: Proposing Edits",
    description: <MarkdownRender text={"You can even change parent and children nodes by clicking on this icon."} />,
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
  },
  {
    localSnapshot: [
      { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: true, editable: true },
    ],
    targetId: "00",
    childTargetId: "00-button-propose-cancel",
    title: "Proposals: Proposing Edits",
    description: (
      <MarkdownRender
        text={
          "Once you are done making the necessary changes, you similarly have the option to propose or cancel on the bottom. "
        }
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
  },
];
console.log(PROPOSING_EDITS_STEPS, FINDING_PREREQUISITES_STEPS);
export const PROPOSAL_STEPS_COMPLETE: NodeTutorialState[] = OVERVIEW_STEPS.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
