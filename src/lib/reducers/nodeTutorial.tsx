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
        description:
          "This is the content of a node. This is where the concept in the title is described in a granular fashion.",
        disabledElements: ["TOOLBAR"],
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
            We are familiar with nodes and their main content, but it is important to learn about their header and
            footer to understand how you can manipulate the map and interact with the nodes
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
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
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "removed", open: false },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        title: "Nodes",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            We are familiar with nodes and their main content, but it is important to learn about their header and
            footer to understand how you can manipulate the map and interact with the nodes
          </Typography>
        ),
        disabledElements: ["TOOLBAR"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: "step002",
        nextStepName: null,
        previosStepName: "step001",
        tooltipPosition: "top",
        stepNumber: 3,
        stepLenght: STEPS_LENGHT,
        isClickeable: false,
      };
    default:
      return state;
  }
}
