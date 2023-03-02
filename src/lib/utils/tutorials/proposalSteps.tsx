import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { NodeTutorialState, StepTutorialConfig, TutorialState } from "../../../nodeBookTypes";
import { INTERACTIVE_TUTORIAL_NOTEBOOK_NODES } from "../interactiveTutorialNodes";
// import { FullNodeData, NodeTutorialState, TutorialState } from "../../nodeBookTypes";
// import { INTERACTIVE_TUTORIAL_NOTEBOOK_NODES } from "../utils/interactiveTutorialNodes";
import { getBaseStepConfig } from "./tutorial.utils";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

dayjs.extend(relativeTime);
// const STEPS_LENGHT = 47; // 65

const DISABLE_NOTEBOOK_OPTIONS = [
  "TOOLBAR",
  "SEARCHER_SIDEBAR",
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

const OVERVIEW_STEPS: StepTutorialConfig[] = [
  {
    localSnapshot: [
      {
        ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"],
        nodeChangeType: "modified",
        open: true,
        defaultOpenPart: "References",
      },
    ],
    targetId: "00",
    title: "Proposals: Overview",
    description: (
      <MarkdownRender text={"Most of what you will do on 1Cademy will revolve around making proposals to nodes."} />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    targetDefaultProperties: { editable: true },
  },
  {
    localSnapshot: [],
    targetId: "00",
    title: "Proposals: Overview",
    description: (
      <MarkdownRender text={"You will need to propose a change to a node in order to add or edit content."} />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    targetDefaultProperties: { editable: true },
  },
  {
    localSnapshot: [],
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
    targetDefaultProperties: { editable: true },
  },
  {
    localSnapshot: [],
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

const FINDING_PREREQUISITES_STEPS: StepTutorialConfig[] = [
  {
    localSnapshot: [],
    targetId: "00",
    title: "Proposals: Finding Prerequisites",
    description: (
      <MarkdownRender
        text={
          "Because new nodes are the children of a node you are editing, an important first step is to determine which node you will be attaching it to."
        }
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    targetDefaultProperties: { editable: true },
  },
  {
    localSnapshot: [],
    targetId: "00",
    title: "Proposals: Finding Prerequisites",
    description: (
      <MarkdownRender
        text={
          "Nodes on 1Cademy represent branches of hierarchical relationships where a user will need to know the first concept to understand the concepts linked as children."
        }
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    targetDefaultProperties: { editable: true },
  },
  {
    localSnapshot: [],
    targetId: "00",
    title: "Proposals: Finding Prerequisites",
    description: (
      <MarkdownRender
        text={
          "Therefore, you need to know the foundational information before you can understand new information. For example, you need to learn how to count before you can learn to add. "
        }
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    targetDefaultProperties: { editable: true },
  },
  {
    localSnapshot: [],
    targetId: "00",
    title: "Proposals: Finding Prerequisites",
    description: (
      <MarkdownRender
        text={
          "When you want to add new content to 1Cademy you need to determine what prerequisite information is required and add your nodes onto the correct prerequisite. If it does not exist then you will need to add it first and link it to the best prerequisite related to what you are adding."
        }
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    targetDefaultProperties: { editable: true },
  },
  {
    localSnapshot: [],
    targetId: "00",
    childTargetId: "toolbar-search-button",
    title: "Proposals: Finding Prerequisites",
    description: (
      <MarkdownRender
        text={"In order to see if the prerequisite already exists, you can use the search feature on the toolbar."}
      />
    ),
    tooltipPosition: "right",
    anchor: "Portal",
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    targetDefaultProperties: { editable: true },
  },
  {
    localSnapshot: [],
    targetId: "00",
    title: "Proposals: Finding Prerequisites",
    description: (
      <MarkdownRender
        text={
          "You can also manually search through an area of nodes by opening children and parent nodes to find the correct branch of information where you would like to add your nodes."
        }
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    targetDefaultProperties: { editable: true },
  },
  {
    localSnapshot: [],
    targetId: "00",
    title: "Proposals: Finding Prerequisites",
    description: (
      <MarkdownRender
        text={"Sometimes you will need to build the branch of nodes leading to the information you intend on adding."}
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    targetDefaultProperties: { editable: true },
  },
];

const PROPOSING_EDITS_STEPS: StepTutorialConfig[] = [
  {
    localSnapshot: [],
    targetId: "00",
    childTargetId: "00-node-body",
    title: "Proposals: Proposing Edits",
    description: <MarkdownRender text={"Try changing the title and content."} />,
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    enableChildElements: ["00-node-title", "00-node-content", "00-node-why"],
    targetDefaultProperties: { editable: true },
  },
  {
    localSnapshot: [],
    targetId: "00",
    childTargetId: "00-node-type-selector",
    title: "Proposals: Proposing Edits",
    description: <MarkdownRender text={"You can also change the type of node here."} />,
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    enableChildElements: ["00-node-type-selector"],
    targetDefaultProperties: { editable: true },
  },
  {
    localSnapshot: [],
    targetId: "00",
    childTargetId: "00-node-references",
    title: "Proposals: Proposing Edits",
    description: <MarkdownRender text={"You can add and remove citations."} />,
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    targetDefaultProperties: { editable: true },
  },
  {
    localSnapshot: [],
    targetId: "00",
    childTargetId: "00-node-tags",
    title: "Proposals: Proposing Edits",
    description: <MarkdownRender text={"Add or remove tags here."} />,
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    targetDefaultProperties: { editable: true },
  },
  {
    localSnapshot: [],
    targetId: "00",
    childTargetId: "00-button-parent-children",
    title: "Proposals: Proposing Edits",
    description: <MarkdownRender text={"You can even change parent and children nodes by clicking on this icon."} />,
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    targetDefaultProperties: { editable: true },
  },
  {
    localSnapshot: [],
    targetId: "00",
    childTargetId: "00-button-propose-proposal",
    title: "Proposals: Proposing Edits",
    description: (
      <MarkdownRender
        text={
          "Once you are done making the necessary changes, you similarly have the option to propose or cancel on the bottom. "
        }
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    enableChildElements: ["00-button-propose-proposal"],
    targetDefaultProperties: { editable: true, defaultOpenPart: "References" },
    isClickeable: true,
  },
];

const RECONCILING_PROPOSALS_STEPS: StepTutorialConfig[] = [
  {
    localSnapshot: [],
    targetId: "00",
    title: "Proposals: Reconciling Proposals",
    description: (
      <MarkdownRender
        text={"Just because you have proposed a change, it does not mean that the change will be implemented."}
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    targetDefaultProperties: {
      editable: false,
      defaultOpenPart: null,
      corrects: 1,
      correct: true,
      changedAt: new Date(),
    },
  },
  {
    localSnapshot: [],
    targetId: "00",
    childTargetId: "00-node-footer-votes",
    title: "Proposals: Reconciling Proposals",
    description: (
      <MarkdownRender
        text={
          "Proposals need to be approved by more than one person in some cases, it depends on the net vote of the node that the proposals are changing."
        }
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    tooltipPosition: "bottom",
    targetDefaultProperties: { editable: false },
  },
  {
    localSnapshot: [],
    targetId: "00",
    childTargetId: "00-node-footer-votes",
    title: "Proposals: Reconciling Proposals",
    description: (
      <MarkdownRender
        text={
          "As we discussed earlier, every node has a net vote. This is the difference between upvotes and downvotes and can be calculated here."
        }
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    tooltipPosition: "bottom",
  },
  {
    localSnapshot: [],
    targetId: "00",
    childTargetId: "00-node-footer-votes",
    title: "Proposals: Reconciling Proposals",
    description: (
      <MarkdownRender
        text={"A proposal needs to have a number of approving votes equal to half of the net vote number."}
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    tooltipPosition: "bottom",
  },
  {
    localSnapshot: [],
    targetId: "00",
    childTargetId: "00-node-footer-votes",
    title: "Proposals: Reconciling Proposals",
    description: (
      <MarkdownRender
        text={"For example, a node with 4 upvotes and 0 downvotes needs 2 votes for a proposal to change it."}
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    tooltipPosition: "bottom",
  },
  {
    localSnapshot: [],
    targetId: "00",
    childTargetId: "00-node-footer-votes",
    title: "Proposals: Reconciling Proposals",
    description: (
      <MarkdownRender
        text={
          "Another example is if a node has 7 upvotes and 1 downvote, a proposal will need 3 upvotes to be approved."
        }
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    tooltipPosition: "bottom",
  },
  {
    localSnapshot: [],
    targetId: "00",
    childTargetId: "00-node-footer-votes",
    title: "Proposals: Reconciling Proposals",
    description: (
      <MarkdownRender
        text={
          "A proposal to a node with a netvote of 2 or less will automatically be approved as the proposal itself automatically carries a single vote in its favor from the person that made it."
        }
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    tooltipPosition: "bottom",
  },
  {
    localSnapshot: [],
    targetId: "00",
    childTargetId: "00-node-footer-downvotes",
    title: "Proposals: Reconciling Proposals",
    description: (
      <MarkdownRender
        text={
          "Proposals can also receive downvotes, which will affect the number of upvotes needed to approve the proposal."
        }
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    tooltipPosition: "bottom",
  },
  {
    localSnapshot: [],
    targetId: "00",
    childTargetId: "00-node-footer-downvotes",
    title: "Proposals: Reconciling Proposals",
    description: (
      <MarkdownRender
        text={
          "For example, if a node with 7 upvotes and 1 downvote, a proposal with 4 upvotes and 1 downvote will be approved"
        }
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    tooltipPosition: "bottom",
  },
  {
    localSnapshot: [],
    targetId: "00",
    childTargetId: "00-node-footer-downvotes",
    title: "Proposals: Reconciling Proposals",
    description: (
      <MarkdownRender
        text={
          "However, if a node with 8 upvotes and 2 downvotes has a proposal with 5 upvotes and 4 downvotes, the proposal will not be implemented."
        }
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    tooltipPosition: "bottom",
  },
  {
    localSnapshot: [],
    targetId: "00",
    childTargetId: "00-node-footer-votes",
    title: "Proposals: Reconciling Proposals",
    description: (
      <MarkdownRender
        text={
          "A proposal that has been made but not received an adequate number of upvotes is a pending proposal. It will remain there until it is deleted by its creator."
        }
      />
    ),
    disabledElements: [...DISABLE_NOTEBOOK_OPTIONS, "00"],
    tooltipPosition: "bottom",
  },
];
console.log(PROPOSING_EDITS_STEPS, FINDING_PREREQUISITES_STEPS);
export const PROPOSAL_STEPS_COMPLETE: NodeTutorialState[] = [
  ...OVERVIEW_STEPS,
  ...FINDING_PREREQUISITES_STEPS,
  ...PROPOSING_EDITS_STEPS,
  ...RECONCILING_PROPOSALS_STEPS,
].map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
