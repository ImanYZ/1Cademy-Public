import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import ShareIcon from "@mui/icons-material/Share";
import { Typography } from "@mui/material";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { DispatchNodeTutorialAction, SetStepType, TutorialState } from "../../nodeBookTypes";
import { INTERACTIVE_TUTORIAL_NOTEBOOK_NODES } from "../utils/interactiveTutorialNodes";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

const STEPS_LENGHT = 65;

const getNextStep = (step: SetStepType): SetStepType => {
  if (!step) return 1;
  if (step === 100) return null;
  return (step + 1) as SetStepType;
};
const getPrevStep = (step: SetStepType): SetStepType => {
  if (!step) return null;
  if (step === 1) return 1;
  return (step - 1) as SetStepType;
};

/**
EX: for notebook sections
 "TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"
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
 */

export function nodeTutorialReducer(
  state: TutorialState,
  { payload, ...action }: DispatchNodeTutorialAction
): TutorialState {
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: ["01-hiden-button"],
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: ["01-hide-offsprings-button"],
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: ["01-close-button"],
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
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "modified", open: true },
        ],
        childTargetId: "01-node-title",
        title: "Nodes - Node Body",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            Each node has a body that consists of a title and content.
          </Typography>
        ),
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
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
          <MarkdownRender
            text={
              "To learn more about how to write mathematical formulas look at this page: [mathjax-basic-tutorial-and-quick-reference](https://math.meta.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference)"
            }
            customClass={"custom-react-markdown"}
            sx={{ fontWeight: 400, letterSpacing: "inherit" }}
          />
        ),
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: ["01-node-footer-user"],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: ["01-node-footer-type"],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
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
            The fourth icon is the propose/evaluate versions of this node button.This allows you to edit the node or add
            children nodes to it.
          </Typography>
        ),
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: ["01-node-footer-downvotes"],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: ["01-node-footer-upvotes"],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: ["01-node-footer-tags-citations"],
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: ["01-button-parent-children"],
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: ["01-button-parent-children"],
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: ["01-node-footer-ellipsis"],
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: ["01-node-footer-ellipsis"],
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: ["01-node-footer-ellipsis"],
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
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: ["01-node-footer-ellipsis"],
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
    case 41:
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
        disabledElements: ["TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: ["01-node-footer-ellipsis"],
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
    case 42: //42
      if (payload.callback) payload?.callback();
      return {
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["02"], nodeChangeType: "removed", open: true },
        ],
        targetId: "01",
        childTargetId: "01-node-footer-type",
        title: "Nodes - Type of Nodes",
        description: (
          // <Typography variant="body1" sx={{ mb: "16px" }}>
          //   You can mark a node as studied or bookmarked here.
          // </Typography>
          <Typography variant="body1" sx={{ mb: "16px" }}>
            There are 6 different types of nodes that all serve specific purposes on 1Cademy
          </Typography>
        ),
        disabledElements: ["TOOLBAR", "01", "02", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 43: //43
      if (payload.callback) payload?.callback();
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["02"], nodeChangeType: "added", open: true },
        ],
        targetId: "02",
        childTargetId: "02-node-footer-type",
        title: "Nodes - Concept",
        description: (
          // <Typography variant="body1" sx={{ mb: "16px" }}>
          //   You can mark a node as studied or bookmarked here.
          // </Typography>
          <Typography variant="body1" sx={{ mb: "16px" }}>
            Concept nodes can be identified by this icon. They represent a single idea or concept.
          </Typography>
        ),
        disabledElements: ["TOOLBAR", "01", "02", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 44: //44
      return {
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["02"], nodeChangeType: "added", open: true },
        ],
        targetId: "02",
        childTargetId: "02-node-footer-type",
        title: "Nodes - Concept",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            Concepts can be superordinate or subordinate.
          </Typography>
        ),
        disabledElements: ["TOOLBAR", "01", "02", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 45: //44
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // {
          //   ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
          //   nodeChangeType: "added",
          //   open: true,
          //   title: "Music",
          //   content:
          //     '"Music" is a superordinate concept that encompasses various genres, styles, and types of music. Music is a form of artistic expression that uses sound to create emotional and aesthetic experiences for the listener.',
          // },
        ],
        targetId: "02",
        childTargetId: "02-node-footer-type",
        title: "Nodes - Concept",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            A superordinate concept is a general concept or topic. For example, language is a broad topic that
            incorporates many concepts in it.
          </Typography>
        ),
        disabledElements: ["TOOLBAR", "01", "02", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 46: //44
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // {
          //   ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
          //   nodeChangeType: "modified",
          //   open: true,
          //   title: "Classical Music",
          //   content:
          //     "Classical music is a genre of music that is typically characterized by the use of orchestral instruments and is known for its complex harmonies and rich melodies.",
          // },
        ],
        targetId: "02",
        childTargetId: "02-node-footer-type",
        title: "Nodes - Concept",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            Subordinate concepts are specific concepts. An example of a subordinate concept is language comprehension
            because it is a subordinate topic within the topic of language.
          </Typography>
        ),
        disabledElements: ["TOOLBAR", "01", "02", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 47: //44
      if (payload.callback) payload?.callback();
      return {
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["02"], nodeChangeType: "added", open: true },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["03"], nodeChangeType: "removed", open: true, nodeType: "Relation" },
        ],
        targetId: "02",
        childTargetId: "02-node-footer-type",
        title: "Nodes - Concept",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            In terms of node type, whether a concept is subordinate or superordinate does not matter, they will be
            designated as concept nodes.
          </Typography>
        ),
        disabledElements: ["TOOLBAR", "01", "02", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 48: //44
      if (payload.callback) payload.callback();
      return {
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["02"], nodeChangeType: "added", open: true },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["03"], nodeChangeType: "added", open: true, nodeType: "Relation" },

          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // {
          //   ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
          //   nodeChangeType: "modified",
          //   nodeType: "Relation",
          //   open: true,
          //   title: "Location",
          //   content:
          //     "Refers to the position or place of an object in relation to other objects. It is a way of describing where something is in physical space",
          // },
        ],
        targetId: "03",
        childTargetId: "03-node-footer-type",
        title: "Nodes - Relation",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            Relation nodes can be identified by this icon. Relation nodes identify multiple concepts without defining
            them. They serve to link or arrange groups of concepts.
          </Typography>
        ),
        disabledElements: ["TOOLBAR", "01", "02", "03", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 49: //44
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // {
          //   ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
          //   nodeChangeType: "modified",
          //   nodeType: "Relation",
          //   open: true,
          //   title: "Location",
          //   content: "- DistanceLatitude and longitude\n - GPS\n - Direction\n - Address\n - Geography",
          // },
        ],
        targetId: "03",
        childTargetId: "03-node-footer-type",
        title: "Nodes - Relation",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            Typically, though not always, relation nodes are bulleted lists of terms representing concepts, rather than
            a paragraph of description.
          </Typography>
        ),
        disabledElements: ["TOOLBAR", "01", "02", "03", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 50: //44
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeType: "Relation" },
        ],
        targetId: "03",
        childTargetId: "03-node-footer-type",
        title: "Nodes - Concept vs Relation",
        description: (
          <>
            <Typography variant="body1" sx={{ mb: "16px" /* , display: "flex", alignItems: "center"  */ }}>
              It can be difficult to determine the difference between a concept <LocalLibraryIcon fontSize="small" />
              and relation <ShareIcon fontSize="small" /> node.
            </Typography>
          </>
        ),
        disabledElements: ["TOOLBAR", "01", "02", "03", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 51: //44
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeType: "Relation" },
        ],
        targetId: "03",
        childTargetId: "03-node-footer-type",
        title: "Nodes - Concept vs Relation",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" /* , display: "flex", alignItems: "center" */ }}>
            Typically a concept node <LocalLibraryIcon fontSize="small" /> will be a paragraph and a relation{" "}
            <ShareIcon /> node will be a bulleted list, but this is not always the case.
          </Typography>
        ),
        disabledElements: ["TOOLBAR", "01", "02", "03", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };

    case 52: //44
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeType: "Relation" },
        ],
        targetId: "03",
        childTargetId: "03-node-footer-type",
        title: "Nodes - Concept vs Relation",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            Strictly speaking, a concept node is a single, discreet concept that is then described.
          </Typography>
        ),
        disabledElements: ["TOOLBAR", "01", "02", "03", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 53: //44
      if (payload.callback) payload?.callback();
      return {
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["03"], nodeChangeType: "added", open: true, nodeType: "Relation" },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["04"],
            nodeChangeType: "removed",
            open: true,
            nodeType: "Reference",
          },
        ],
        targetId: "03",
        childTargetId: "03-node-footer-type",
        title: "Nodes - Concept vs Relation",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" /* , display: "flex", alignItems: "center"  */ }}>
            A relation node <ShareIcon fontSize="small" /> identifies two or more concepts without defining them. It
            serves to connect related concept nodes which are then linked as children concept nodes.
          </Typography>
        ),
        disabledElements: ["TOOLBAR", "01", "02", "03", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 54: //44
      if (payload.callback) payload.callback();
      return {
        localSnapshot: [
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["04"],
            nodeChangeType: "added",
            open: true,
            nodeType: "Reference",
          },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // {
          //   ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"],
          //   nodeChangeType: "modified",
          //   nodeType: "Reference",
          //   open: true,
          //   title: "Music Education",
          //   content:
          //     "Wikimedia Foundation. (2022, June 28). Music education. Wikipedia. Retrieved July 26, 2022, from https://en.wikipedia.org/wiki/Music_education",
          // },
        ],
        targetId: "04",
        childTargetId: "04-node-footer-type",
        title: "Nodes - Reference",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            Reference nodes can be identified by this icon. Their purpose is to contain reference information and to be
            cited in other types of nodes.
          </Typography>
        ),
        disabledElements: ["TOOLBAR", "01", "02", "03", "04", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 55: //44
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeType: "Reference" },
        ],
        targetId: "04",
        childTargetId: "04-node-footer-type",
        title: "Nodes - Reference",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            Reference nodes contain citations in APA format for things like videos, scholarly articles, books, websites,
            and audio.
          </Typography>
        ),
        disabledElements: ["TOOLBAR", "01", "02", "03", "04", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 56: //44
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeType: "Reference" },
        ],
        targetId: "04",
        childTargetId: "04-node-footer-type",
        title: "Nodes - Reference",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            It is important to note that reference nodes cite a whole source, information about page numbers, chapters,
            sections, timestamps, or webpages are not included in this type of node.
          </Typography>
        ),
        disabledElements: ["TOOLBAR", "01", "02", "03", "04", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 57: //44
      if (payload.callback) payload?.callback();
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },

          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["05"],
            nodeChangeType: "removed",
            open: true,
            nodeType: "Idea",
          },
        ],
        targetId: "04",
        childTargetId: "04-node-footer-type",
        title: "Nodes - Reference",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            You will want to edit a node by clicking the pencil icon and choose a reference node as a child. In this
            node you will make the cited source’s title the title of the node and fill the content section with the full
            APA citation.
          </Typography>
        ),
        disabledElements: ["TOOLBAR", "01", "02", "03", "04", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 58: //44
      if (payload.callback) payload.callback();
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["05"],
            nodeChangeType: "added",
            open: true,
            nodeType: "Idea",
          },
        ],
        targetId: "05",
        childTargetId: "05-node-footer-type",
        title: "Nodes - Idea",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            Idea nodes can be identified by this icon. They are used to add ideas not adapted from any source.
          </Typography>
        ),
        disabledElements: ["TOOLBAR", "01", "02", "03", "04", "05", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 59: //44
      if (payload.callback) payload?.callback();

      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeType: "Idea" },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["06"],
            nodeChangeType: "removed",
            open: true,
            nodeType: "Question",
          },
        ],
        targetId: "05",
        childTargetId: "05-node-footer-type",
        title: "Nodes - Idea",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            Idea nodes can be used to offer feedback on a node or suggest a direction with future research in an area.
          </Typography>
        ),
        disabledElements: ["TOOLBAR", "01", "02", "03", "04", "05", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 60: //44
      if (payload.callback) payload.callback();
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeType: "Question" },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["06"],
            nodeChangeType: "added",
            open: true,
            nodeType: "Question",
          },
        ],
        targetId: "06",
        childTargetId: "06-node-footer-type",
        title: "Nodes - Question",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            Question nodes can be identified by this icon. They are used to ask a MULTIPLE CHOICE QUESTION
          </Typography>
        ),
        disabledElements: ["TOOLBAR", "01", "02", "03", "04", "05", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 61: //44
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeType: "Question" },
        ],
        targetId: "06",
        childTargetId: "06-node-footer-type",
        title: "Nodes - Question",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            These nodes are used to help study a section of content. A user can select options to answer a question and
            will receive feedback.
          </Typography>
        ),
        disabledElements: ["TOOLBAR", "01", "02", "03", "04", "05", "06", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 62: //44
      if (payload.callback) payload?.callback();

      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeType: "Question" },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["07"],
            nodeChangeType: "removed",
            open: true,
            nodeType: "Code",
          },
        ],
        targetId: "06",
        childTargetId: "06-node-footer-type",
        title: "Nodes - Question",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            Question nodes are not used to ask other users questions about a node or 1Cademy practices. That is
            something you can do in a community meeting.
          </Typography>
        ),
        disabledElements: ["TOOLBAR", "01", "02", "03", "04", "05", "06", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD"],
        enableChildElements: [],
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 63: //44
      if (payload.callback) payload.callback();
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeType: "Code" },
          {
            ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["07"],
            nodeChangeType: "added",
            open: true,
            nodeType: "Code",
          },
        ],
        targetId: "07",
        childTargetId: "07-node-footer-type",
        title: "Nodes - Code",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            Code nodes can be identified by this icon. They are used to display a code snippet of a specified programing
            language.
          </Typography>
        ),
        disabledElements: [
          "TOOLBAR",
          "01",
          "02",
          "03",
          "04",
          "05",
          "06",
          "07",
          "LIVENESS_BAR",
          "COMMUNITY_LEADERBOARD",
        ],
        enableChildElements: [],
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 64: //44
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeType: "Code" },
        ],
        targetId: "07",
        childTargetId: "07-node-footer-type",
        title: "Nodes - Code",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            Four languages can be specified in a code node: Python, R, HTML, and JavaScript.
          </Typography>
        ),
        disabledElements: [
          "TOOLBAR",
          "01",
          "02",
          "03",
          "04",
          "05",
          "06",
          "07",
          "LIVENESS_BAR",
          "COMMUNITY_LEADERBOARD",
        ],
        enableChildElements: [],
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case 65: //44
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeType: "Code" },
        ],
        targetId: "06",
        childTargetId: "06-node-footer-type",
        title: "Nodes - Code",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            Each code node is color coded to reflect its specified language.
          </Typography>
        ),
        disabledElements: [
          "TOOLBAR",
          "01",
          "02",
          "03",
          "04",
          "05",
          "06",
          "07",
          "LIVENESS_BAR",
          "COMMUNITY_LEADERBOARD",
        ],
        enableChildElements: [],
        anchor: "",
        currentStepName: action.type,
        nextStepName: getNextStep(action.type),
        previosStepName: getPrevStep(action.type),
        tooltipPosition: "bottom",
        stepNumber: action.type,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    default:
      return state;
  }
}
