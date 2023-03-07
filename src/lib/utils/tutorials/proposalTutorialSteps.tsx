import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { TutorialState, TutorialStep, TutorialStepConfig } from "src/nodeBookTypes";

import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { getBaseStepConfig } from "./tutorial.utils";

// import { FullNodeData, NodeTutorialState, TutorialState } from "../../nodeBookTypes";
// import { INTERACTIVE_TUTORIAL_NOTEBOOK_NODES } from "../utils/interactiveTutorialNodes";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

dayjs.extend(relativeTime);
// const STEPS_LENGHT = 47; // 65

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

const PROPOSING_CONCEPT_EDIT: TutorialStepConfig[] = [
  {
    title: "Proposing Edits - Concept Node",
    description: (
      <MarkdownRender
        text={
          "Proposing an edit of **Concept Node** you will change the represented **idea** or **concept** of this node, wheter a **superordinate** or **subordinate** Concept"
        }
      />
    ),
  },
];

const PROPOSING_RELATION_EDIT: TutorialStepConfig[] = [
  {
    title: "Proposing Edits - Relation Node",
    description: (
      <MarkdownRender
        text={
          "Proposing an edit to the **Relation Node** will affect multiple concepts identified within the node. It is important to note that the **Relation node** does not define these concepts."
        }
      />
    ),
  },
];

const PROPOSING_REFERENCE_EDIT: TutorialStepConfig[] = [
  {
    title: "Proposing Edits - Reference Node",
    description: (
      <MarkdownRender
        text={
          "Proposing an edit to the **Reference Node** involves adding, modifying, or deleting reference information, Note that purpose is to be cited in other types of nodes."
        }
      />
    ),
  },
];

const PROPOSING_IDEA_EDIT: TutorialStepConfig[] = [
  {
    title: "Proposing Edits - Idea Node",
    description: (
      <MarkdownRender
        text={
          "Proposing an edit to the **Idea Node** involves revising the content of the node to provide **constructive feedback** or suggest new directions for future research. Remember to be concise and clear in your feedback."
        }
      />
    ),
  },
];

const PROPOSING_QUESTION_EDIT: TutorialStepConfig[] = [
  {
    title: "Proposing Edits - Question Node",
    description: (
      <MarkdownRender
        text={
          "Proposing an edit to the **Question Node**  involves modifying the content of a multiple-choice question and its answer options. This can include changing the wording of the question, adding or removing answer options, or adjusting the feedback given to the user after answering the question."
        }
      />
    ),
  },
];

const PROPOSING_CODE_EDIT: TutorialStepConfig[] = [
  {
    title: "Proposing Edits - Code Node",
    description: (
      <MarkdownRender
        text={
          "Proposing an edit to the **Code Node** involves making changes to the displayed code snippet of a specified programming language. This can include modifying existing code, adding new code, or removing existing code using the appropriate programming syntax."
        }
      />
    ),
  },
];

const PROPOSING_EDITS_STEPS: TutorialStepConfig[] = [
  {
    childTargetId: "node-body",
    title: "Proposing Edits - Edit Title",
    description: <MarkdownRender text={"You can start changing the title"} />,
  },
  {
    childTargetId: "preview-edit",
    title: "Proposing Edits - Preview or Edit",
    description: <MarkdownRender text={"You can switch to preview what you have changed before"} />,
  },
  {
    childTargetId: "node-footer-user",
    title: "Proposing Edits - Contributor",
    description: (
      <MarkdownRender
        text={"Note that the contributor is the person that has done the most to make the node in its present form."}
      />
    ),
  },
  {
    childTargetId: "node-type-selector",
    title: "Proposing Edits - Node Type",
    description: <MarkdownRender text={"You can also change the type of node here."} />,
  },
  {
    childTargetId: "node-footer-image-video",
    title: "Proposing Edits - Image or Video",
    description: <MarkdownRender text={"You can also upload a small image or video"} />,
  },
  {
    childTargetId: "node-footer-tags-citations",
    title: "Proposing Edits - Tags and Citations",
    description: (
      <MarkdownRender
        text={"You can add and remove **Tags** or **Citations** to references used in the content of the node."}
      />
    ),
  },

  {
    childTargetId: "button-parent-children",
    title: "Proposing Edits - Parent and Children",
    description: <MarkdownRender text={"You can even change parent and children nodes by clicking on this icon."} />,
  },
  {
    childTargetId: "button-propose-proposal",
    title: "Proposing Edits - Propose",
    description: (
      <MarkdownRender
        text={
          "Let's assume you just made some changes. Now, it's the time to click this button to submit your proposal. Alternatively, you can click the cancel button, to withdraw your proposal."
        }
      />
    ),

    isClickeable: true,
  },
];

// const RECONCILING_PROPOSALS_STEPS: TutorialStepConfig[] = [
//   {
//     title: "Proposals: Reconciling Proposals",
//     description: (
//       <MarkdownRender
//         text={"Just because you have proposed a change, it does not mean that the change will be implemented."}
//       />
//     ),
//   },
//   {
//     childTargetId: "node-footer-votes",
//     title: "Proposals: Reconciling Proposals",
//     description: (
//       <MarkdownRender
//         text={
//           "Proposals need to be approved by more than one person in some cases, it depends on the net vote of the node that the proposals are changing."
//         }
//       />
//     ),

//     tooltipPosition: "bottom",
//   },
//   {
//     childTargetId: "node-footer-votes",
//     title: "Proposals: Reconciling Proposals",
//     description: (
//       <MarkdownRender
//         text={
//           "As we discussed earlier, every node has a net vote. This is the difference between upvotes and downvotes and can be calculated here."
//         }
//       />
//     ),

//     tooltipPosition: "bottom",
//   },
//   {
//     childTargetId: "node-footer-votes",
//     title: "Proposals: Reconciling Proposals",
//     description: (
//       <MarkdownRender
//         text={
//           "If a proposal gets a number of approving votes equal to half of the net vote on the corresponding node, it will be automatically accepted and the corresponding changes are made on the map."
//         }
//       />
//     ),

//     tooltipPosition: "bottom",
//   },
//   {
//     childTargetId: "node-footer-votes",
//     title: "Proposals: Reconciling Proposals",
//     description: (
//       <MarkdownRender
//         text={"For example, a node with 4 upvotes and 0 downvotes needs 2 votes for a proposal to change it."}
//       />
//     ),

//     tooltipPosition: "bottom",
//   },
//   {
//     childTargetId: "node-footer-votes",
//     title: "Proposals: Reconciling Proposals",
//     description: (
//       <MarkdownRender
//         text={
//           "Another example is if a node has 7 upvotes and 1 downvote, a proposal will need 3 upvotes to be approved."
//         }
//       />
//     ),

//     tooltipPosition: "bottom",
//   },
//   {
//     childTargetId: "node-footer-votes",
//     title: "Proposals: Reconciling Proposals",
//     description: (
//       <MarkdownRender
//         text={
//           "A proposal to a node with a netvote of 2 or less will automatically be approved as the proposal itself automatically carries a single vote in its favor from the person that made it."
//         }
//       />
//     ),

//     tooltipPosition: "bottom",
//   },
//   {
//     childTargetId: "node-footer-downvotes",
//     title: "Proposals: Reconciling Proposals",
//     description: (
//       <MarkdownRender
//         text={
//           "Proposals can also receive downvotes, which will affect the number of upvotes needed to approve the proposal."
//         }
//       />
//     ),

//     tooltipPosition: "bottom",
//   },
//   {
//     childTargetId: "node-footer-downvotes",
//     title: "Proposals: Reconciling Proposals",
//     description: (
//       <MarkdownRender
//         text={
//           "For example, if a node has 7 upvotes and 1 downvote, a proposal with 4 upvotes and 1 downvote will be approved."
//         }
//       />
//     ),

//     tooltipPosition: "bottom",
//   },
//   {
//     childTargetId: "node-footer-downvotes",
//     title: "Proposals: Reconciling Proposals",
//     description: (
//       <MarkdownRender
//         text={
//           "However, if a node with 8 upvotes and 2 downvotes has a proposal with 5 upvotes and 4 downvotes, the proposal will not be implemented."
//         }
//       />
//     ),

//     tooltipPosition: "bottom",
//   },
//   {
//     targetId: "toolbar-pending-list",
//     childTargetId: "toolbar-pending-list",
//     title: "Proposals: Reconciling Proposals",
//     description: (
//       <MarkdownRender
//         text={"You can see all the proposals that are pending by clicking on the pending list button here."}
//       />
//     ),
//     anchor: "Portal",

//     tooltipPosition: "right",
//   },
// ];
// console.log(OVERVIEW_STEPS, PROPOSING_EDITS_STEPS, FINDING_PREREQUISITES_STEPS, RECONCILING_PROPOSALS_STEPS);
export const PROPOSAL_STEPS_COMPLETE: TutorialStep[] = PROPOSING_EDITS_STEPS.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});

export const PROPOSING_CONCEPT_EDIT_COMPLETE: TutorialStep[] = PROPOSING_CONCEPT_EDIT.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const PROPOSING_RELATION_EDIT_COMPLETE: TutorialStep[] = PROPOSING_RELATION_EDIT.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const PROPOSING_REFERENCE_EDIT_COMPLETE: TutorialStep[] = PROPOSING_REFERENCE_EDIT.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const PROPOSING_IDEA_EDIT_COMPLETE: TutorialStep[] = PROPOSING_IDEA_EDIT.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const PROPOSING_QUESTION_EDIT_COMPLETE: TutorialStep[] = PROPOSING_QUESTION_EDIT.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const PROPOSING_CODE_EDIT_COMPLETE: TutorialStep[] = PROPOSING_CODE_EDIT.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
