import { Step } from "../../hooks/useInteractiveTutorial";

export const NOTEBOOK_STEPS: Step[] = [
  {
    id: "t-1",
    title: "step 1",
    description: "description step-1 with Cb",
    tooltipPos: "right",
    anchor: "portal",
    callback: () => console.log("doing cb in step t1"),
    disabledElements: ["button-1"],
  },
  {
    id: "n1",
    title: "step 2",
    description: "description step-2",
    tooltipPos: "left",
    anchor: "",
    disabledElements: ["button-2"],
  },
  {
    id: "t-2",
    title: "step 3",
    description: "description step-3",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: ["button-1", "button-2"],
  },
  {
    id: "n2",
    title: "step 4",
    description: "description step-4 with Cb",
    tooltipPos: "top",
    anchor: "",
    callback: () => console.log("doing cb in step n2"),
    disabledElements: [],
  },
];
