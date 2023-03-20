import { TutorialState, TutorialStep, TutorialStepConfig } from "src/nodeBookTypes";

import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { getBaseStepConfig } from "./tutorial.utils";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

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
          "Once you have created a proposal and are satisfied with its content, you can click on the **propose button**. This will submit the proposal you have worked on."
        }
      />
    ),

    isClickeable: true,
  },
];

export const PROPOSAL_STEPS_COMPLETE: TutorialStep[] = PROPOSING_EDITS_STEPS.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
