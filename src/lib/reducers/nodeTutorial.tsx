import { Typography } from "@mui/material";

import { DispatchNodeTutorialAction, TutorialState } from "../../nodeBookTypes";
import { INTERACTIVE_TUTORIAL_NOTEBOOK_NODES } from "../utils/interactiveTutorialNodes";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

const STEPS_LENGHT = 10;

export function nodeTutorialReducer(state: TutorialState, action: DispatchNodeTutorialAction): TutorialState {
  console.log("set difeault step");

  switch (action.type) {
    case null:
      return null;
    case "default":
      return {
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        title: "Introduction",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            We are familiar with nodes and their main content, but it is important to learn about their header and
            footer to understand how you can manipulate the map and interact with the nodes
          </Typography>
        ),
        disabledElements: ["TOOLBAR", "01"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: "default",
        nextStepName: "step001",
        previosStepName: null,
        tooltipPosition: "top",
        stepNumber: 1,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case "step001":
      return {
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        title: "Nodes",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            Node headers are one of the ways that you can manipulate what you see on the knowledge graph.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        targetChildId: "01-node-header",
        anchor: "",
        currentStepName: "step001",
        nextStepName: "step002",
        previosStepName: "default",
        tooltipPosition: "top",
        stepNumber: 2,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case "step002":
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        title: "Nodes",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            In the header are four buttons.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        targetChildId: "01-node-header",
        anchor: "",
        currentStepName: "step002",
        nextStepName: "step003",
        previosStepName: "step001",
        tooltipPosition: "top",
        stepNumber: 3,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case "step003":
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        title: "Nodes",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            This one, which we looked at earlier closes the node. Once again, it just removes it from your view, it does
            not delete the node from the platform.
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        targetChildId: "01-hiden-button",
        anchor: "",
        currentStepName: "step003",
        nextStepName: "step004",
        previosStepName: "step002",
        tooltipPosition: "top",
        stepNumber: 4,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case "step004":
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        title: "Nodes",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            This one closes all the open children nodes of the node it is clicked on.
          </Typography>
        ),
        targetChildId: "01-hide-offsprings-button",
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: "step004",
        nextStepName: "step005",
        previosStepName: "step003",
        tooltipPosition: "top",
        stepNumber: 5,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case "step005":
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        title: "Nodes",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            This one minimizes the content in a node so only the title is displayed.
          </Typography>
        ),
        targetChildId: "01-close-button",
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: "step005",
        nextStepName: "step006",
        previosStepName: "step004",
        tooltipPosition: "top",
        stepNumber: 6,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case "step006":
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        title: "Nodes",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            Each node has a body that consists of a title and content.
          </Typography>
        ),
        targetChildId: "01-node-title",
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: "step006",
        nextStepName: "step007",
        previosStepName: "step005",
        tooltipPosition: "top",
        stepNumber: 6,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    case "step007":
      return {
        localSnapshot: [
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          // { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        title: "Nodes",
        description: <Typography variant="body1" sx={{ mb: "16px" }}></Typography>,
        targetChildId: "",
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "",
        anchor: "",
        currentStepName: "step007",
        nextStepName: "step008",
        previosStepName: "step006",
        tooltipPosition: "top",
        stepNumber: 7,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };

    default:
      return state;
  }
}
