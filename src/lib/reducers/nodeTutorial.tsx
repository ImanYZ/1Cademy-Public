import { Link, Typography } from "@mui/material";

import { DispatchNodeTutorialAction, SetStepType, TutorialState } from "../../nodeBookTypes";
import { INTERACTIVE_TUTORIAL_NOTEBOOK_NODES } from "../utils/interactiveTutorialNodes";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

const STEPS_LENGHT = 41;

const getNextStep = (step: SetStepType): SetStepType => {
  if (!step) return 1;
  if (step === 50) return null;
  return (step + 1) as SetStepType;
};
const getPrevStep = (step: SetStepType): SetStepType => {
  if (!step) return null;
  if (step === 1) return 1;
  return (step - 1) as SetStepType;
};

export function nodeTutorialReducer(state: TutorialState, action: DispatchNodeTutorialAction): TutorialState {
  console.log("set difeault step");

  switch (action.type) {
    case null:
      return null;
    case 1:
      return {
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        targetId: "01",
        title: "Nodes",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            We are familiar with nodes and their main content, but it is important to learn about their header and
            footer to understand how you can manipulate the map and interact with the nodes.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 2:
      return {
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        title: "Nodes - Node Header",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            Node headers are one of the ways that you can manipulate what you see on the knowledge graph.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        childTargetId: "01-node-header",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 3:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-header",

        title: "Nodes - Node Header",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            In the header are four buttons.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 4:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-hiden-button",
        title: "Nodes - Node Header",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            This one, which we looked at earlier closes the node. Once again, it just removes it from your view, it does
            not delete the node from the platform.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 5:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-hide-offsprings-button",
        title: "Nodes - Node Header",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            This one closes all the open children nodes of the node it is clicked on.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 6:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-close-button",
        title: "Nodes - Node Header",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            This one minimizes the content in a node so only the title is displayed.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 7:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-title",
        title: "Nodes - Node Body",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            Each node has a body that consists of a title and content.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 8:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-title",
        title: "Nodes - Node Title",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            This is the title.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 9:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-title",
        title: "Nodes Body - Node Title",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            We want a title that is concise and accurately describes the information within.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };

    case 10:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-title",
        title: "Nodes Body - Node Title",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            This means that you need to consider if the title is duplicated or would likely be duplicated.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };

    case 11:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-title",
        title: "Nodes Body - Node Title",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            For example, <b>“growth”</b> could be used in a number of titles in a number of subjects. Are we talking
            about an organism growing, a population growing, or economic growth? Make sure the title addresses what is
            specifically being discussed.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };

    case 12:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-content",
        title: "Node Body - Node Content",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            The content of a node describes what is stated in a title.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };

    case 13:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-content",
        title: "Node Body - Node Content",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            We want the content to be clear, concise, and accurate.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };

    case 14:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-content",
        title: "Node Content - Markdown",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            Beyond normal written content, nodes accept basic markdown to make text bold or italic, and to produce
            ordered and unordered lists.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };

    case 15:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-content",
        title: "Node Content - Markdown",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            For <b>bold text</b> you place two stars before and after the text you would like to make bold.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };

    case 16:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        title: "Node Content - Markdown",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            For <i>italicized text</i> you place one star before and after the text you would like to make italicized.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };

    case 17:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-content",
        title: "Node Content - Markdown",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            For an ordered list you type the number, a period, and then a space before each listed item. Listed items
            are placed on their own line.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };

    case 18:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-content",
        title: "Node Content - Markdown",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            for an unordered list you type a dash and a space before each listed item. Listed items are placed on their
            own line.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };

    case 19:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-content",
        title: "Node Content - Math jax",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            You can also use math jax to create mathematical formulas.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };

    case 20:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-content",
        title: "Node Content - Math jax",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            To learn more about how to write mathematical formulas look at this page:
            <br />
            <Link
              href="https://math.meta.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference"
              target={"_blank"}
              rel={"noReferrer"}
            >
              https://math.meta.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference
            </Link>
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };

    case 21:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-footer",
        title: "Nodes - Node Footer",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            The node footer has many icons
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };

    case 22:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-footer-user",
        title: "Nodes - Node Footer",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            The first is the profile of the top contributor to the node. That is the person that has done the most to
            make the node in its present form.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };

    case 23:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-footer-type",
        title: "Nodes - Node Footer",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            The next one indicates what type of node it is, this one is a concept node.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };

    case 24:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-footer-timestamp",
        title: "Nodes - Node Footer",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            The third icon indicates when the latest version of the node was adopted, this one was approved __days ago.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };

    case 25:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-footer-propose",
        title: "Nodes - Node Footer",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            The fourth icon is the purpose/evaluate versions of this node button.This allows you to edit the node or add
            children nodes to it.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };

    case 26:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-footer-votes",
        title: "Nodes - Node Footer",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            The next two icons are the downvote and upvote buttons, which also display each number of votes the node has
            received.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 27:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-footer-votes",
        title: "Node Footer - Up/Down Votes",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            Upvoting and downvoting nodes play an important role in ensuring the quality of content on 1Cademy. In
            effect you are voting on the usefulness of a node.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };

    case 28:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-footer-downvotes",
        title: "Node Footer - Down votes",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            A downvote is infact a vote to remove a node
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 29:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-footer-upvotes",
        title: "Node Footer - Up votes",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            An upvote is a vote to not change a node
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 30:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-footer-votes",
        title: "Node Footer - Up/Down Votes",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            When a ratio with a high enough number of downvotes to upvotes is reached a node can be deleted.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 31:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-footer-votes",
        title: "Node Footer - Up/Down Votes",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            The difference of upvotes and downvotes, called net vote, also determines how many or few approving votes a
            proposal will need to change the node. This will be discussed further later on.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 32:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-footer-tags-citations",
        title: "Node Footer - Tag and Citation",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            The next icons are on a single button and represent the tag and citation for a node.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 33:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-footer-tags-citations",
        title: "Node Footer - Tag and Citation",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            if you press this button the bottom of the node expands and shows the source for the content in the node on
            the left and the tags for the node on the right.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 34:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-button-parent-children",
        title: "Node Footer - Parent and Children",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            The next icon is for parent and child nodes.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 35:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-button-parent-children",
        title: "Node Footer - Parent and Children",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            If you press this button, the bottom will expand and you will see parent nodes on the left and child nodes
            on the right.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 36:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-button-parent-children",
        title: "Node Footer - Parent and Children",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            You can click on either the parent or child nodes to open them in the graph.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,

        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 37:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-footer-ellipsis",
        title: "Node Footer - Other Options",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            Finally the ellipses icon can be clicked to open a few other options.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,

        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 38:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-footer-ellipsis",
        title: "Node Footer - Studied or Bookmarked",
        description: (
          // <Typography variant="body1" sx={{ mb: "16px" }}>
          //   You can mark a node as studied or bookmarked here.
          // </Typography>
          <Typography variant="body1" sx={{ mb: "16px" }}>
            Your can mark a node as studied or bookmarked here.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,

        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 39:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-footer-ellipsis",
        title: "Node Footer - Studied or Bookmarked",
        description: (
          // <Typography variant="body1" sx={{ mb: "16px" }}>
          //   You can mark a node as studied or bookmarked here.
          // </Typography>
          <Typography variant="body1" sx={{ mb: "16px" }}>
            You can also have the node narrated for you.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 40:
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        childTargetId: "01-node-footer-ellipsis",
        title: "Node Footer - Studied or Bookmarked",
        description: (
          // <Typography variant="body1" sx={{ mb: "16px" }}>
          //   You can mark a node as studied or bookmarked here.
          // </Typography>
          <Typography variant="body1" sx={{ mb: "16px" }}>
            Finally, you can share the node to Twitter, Reddit, Facebook, or Linkedin.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "top",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    default:
      return state;
  }
}
