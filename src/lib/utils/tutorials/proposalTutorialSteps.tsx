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

const TMP_EDIT_NODE_CONFIG: TutorialStepConfig[] = [
  {
    title: "Propose Node - Edit Node",
    description: <MarkdownRender text={"**Click** on pencil button to enter in Edit Node"} />,
  },
];

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
    childTargetId: "node-title",
    title: "Proposing Edits - Edit Title",
    description: (
      <MarkdownRender
        text={
          "This field allows you to edit the title. It is important to remember that titles need to be concise but descriptive enough to uniquely identify the concept or group of concepts described in the node."
        }
      />
    ),
  },

  {
    childTargetId: "preview-edit",
    title: "Proposing Edits - Preview or Edit",
    description: (
      <MarkdownRender
        text={
          "The preview allows you to see what the node you are proposing or editing will look like when it is implemented."
        }
      />
    ),
  },
  {
    childTargetId: "node-footer-user",
    title: "Proposing Edits - Contributor",
    description: (
      <MarkdownRender
        text={
          "This is the profile picture for the top contributor of this node. Among all the contributors who submitted proposals on this node, this person received higher netvotes on their proposals on this node."
        }
      />
    ),
  },
  {
    childTargetId: "node-type-selector",
    title: "Proposing Edits - Node Type",
    description: <MarkdownRender text={"You can also change the type of the node here."} />,
  },
  {
    childTargetId: "node-footer-image",
    title: "Proposing Edits - Image ",
    description: (
      <MarkdownRender
        text={
          "Click this button is you'd like to upload an image into the node. It is usually helpful to have some text explaining the image. You should also offer a citation crediting the creator of the image if it is not your own. Note that you're not allowed to upload an image if the creator has not given you the permission to distribute it."
        }
      />
    ),
  },
  {
    childTargetId: "node-footer-video",
    title: "Proposing Edits - Video",
    description: (
      <MarkdownRender text={"Click this button if you'd like to add a slice of a YouTube video to the node."} />
    ),
  },
  {
    childTargetId: "node-footer-tags-citations",
    title: "Proposing Edits - Tags and Citations",
    description: (
      <MarkdownRender
        text={
          "Here you can add references (on the left) and tags (on the right) by clicking “Cite an existing Reference/Tag” and then clicking a reference/tag node that you'd like to cite. You will want to have the reference/tag node you are citing open before doing this. You can also remove a citation by clicking the trash can icon to the right of a citation. The left number shows the number of references and the right one shows the number of tags cited on this node."
        }
      />
    ),
  },

  {
    childTargetId: "button-parent-children",
    title: "Proposing Edits - Parents and Children",
    description: (
      <MarkdownRender
        text={
          "You can even change parent and child nodes by clicking on this icon. The left number shows the number of parents and the right one shows the number of children linked to this node."
        }
      />
    ),
  },
  {
    childTargetId: "button-cancel-proposal",
    title: "Proposing Edits - Cancel Propose",
    description: (
      <MarkdownRender
        text={
          "While working on a proposal, if you determine that you do not want to submit it, you can click on the **cancel button**. This will eliminate the proposed changes you have been working on."
        }
      />
    ),

    isClickeable: true,
  },
  {
    childTargetId: "button-propose-proposal",
    title: "Proposing Edits - Create Proposal",
    description: (
      <MarkdownRender
        text={
          "Once you have created a proposal and are satisfied with its content, you can click the propose button. This will submit the proposal you have worked on."
        }
      />
    ),

    isClickeable: true,
  },
];

export const TMP_EDIT_NODE: TutorialStep[] = TMP_EDIT_NODE_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});

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
