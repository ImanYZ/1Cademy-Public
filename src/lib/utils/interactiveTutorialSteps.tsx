import { Step } from "../../hooks/useInteractiveTutorial";

export const NOTEBOOK_STEPS: Step[] = [
  {
    id: "01",
    title: "Welcome to the Essentials I Tutorial!",
    description:
      "This tutorial will teach you what nodes are and how they work on 1Cademy Read the content of the node and then click Next to continue.",
    tooltipPos: "top",
    anchor: "",
    callback: () => console.log("cb: scroll to Node"),
    disabledElements: [],
  },
  {
    id: "01-content",
    title: "Introduction",
    description:
      "This is the content of a node. This is where the concept in the title is described in a granular fashion. ",
    tooltipPos: "top",
    anchor: "",
    callback: () => console.log("cb: expand Node"),
    disabledElements: [""],
  },
  {
    id: "01",
    title: "Basic Navigation: Parent Nodes",
    description: "Most nodes have parents. They can be seen by clicking this button",
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  {
    id: "01",
    title: "Basic Navigation: Parent Nodes",
    description: "You can see the children nodes listed below in this panel.",
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  {
    id: "01",
    title: "Basic Navigation: Parent Nodes",
    description: "By clicking a title, we are taken to the child node",
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
];
