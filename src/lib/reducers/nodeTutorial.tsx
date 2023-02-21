import { Typography } from "@mui/material";

import { DispatchNodeTutorialAction, TutorialState } from "../../nodeBookTypes";
import { INTERACTIVE_TUTORIAL_NOTEBOOK_NODES } from "../utils/interactiveTutorialNodes";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

export function nodeTutorialReducer(state: TutorialState, action: DispatchNodeTutorialAction): TutorialState {
  console.log("set difeault step");

  switch (action.type) {
    case "default":
      return {
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added", open: false },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "removed", open: true },
        ],
        title: "interactive tutoria",
        description: "default state",
        disabledElements: [],
        enableChildElements: [],
        targetId: "00",
        anchor: "",
        currentStepName: "default",
        nextStepName: "step001",
        previosStepName: null,
        tooltipPosition: "top",
        stepNumber: 1,
        stepLenght: 10,
        isClickeable: false,
      };
    case "step001":
      return {
        localSnapshot: [
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["00"], nodeChangeType: "added" },
          { ...INTERACTIVE_TUTORIAL_NOTEBOOK_NODES["01"], nodeChangeType: "added", open: true },
        ],
        title: "Nodes",
        description: (
          <Typography variant="body1" sx={{ mb: "16px" }}>
            We are familiar with nodes and their main content, but it is important to learn about their header and
            footer to understand how you can manipulate the map and interact with the nodes.
          </Typography>
        ),
        disabledElements: ["bnt-1"],
        enableChildElements: [],
        targetId: "01",
        anchor: "",
        currentStepName: "step001",
        nextStepName: "step002",
        previosStepName: "default",
        tooltipPosition: "top",
        stepNumber: 2,
        stepLenght: 10,
        isClickeable: false,
      };
    default:
      return state;
  }
}
