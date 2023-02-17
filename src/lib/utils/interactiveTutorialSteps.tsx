import { Step } from "../../hooks/useInteractiveTutorial";

export const NOTEBOOK_STEPS: Step[] = [
  {
    targetId: "01",
    title: "Welcome to the Essentials I Tutorial!",
    description:
      "This tutorial will teach you what nodes are and how they work on 1Cademy Read the content of the node and then click Next to continue.",
    tooltipPos: "top",
    anchor: "",
    callback: () => console.log("cb: scroll to Node"),
    disabledElements: [],
  },
  {
    targetId: "01",
    childTargetId: "01-content",
    title: "Introduction",
    description:
      "This is the content of a node. This is where the concept in the title is described in a granular fashion. ",
    tooltipPos: "right",
    anchor: "",
    callback: () => console.log("cb: expand Node"),
    disabledElements: [""],
  },
  {
    targetId: "01",
    childTargetId: "01-button-parent-children",
    title: "Basic Navigation: Parent Nodes",
    description: "Most nodes have parents and children. They can be seen by clicking this button",
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  {
    targetId: "01",
    childTargetId: "01-parents-list",
    title: "Basic Navigation: Parent Nodes",
    description: "You can see the parent node(s) listed below in this panel",
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  {
    targetId: "01",
    childTargetId: "01-parent-button-0", // TODO: add id-parent-button-idx
    title: "Basic Navigation: Parent Nodes",
    description: "By clicking a title, we are taken to the parent node.",
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  // {
  //   targetId: "01",
  //   childTargetId: "01-button-parent-children",
  //   title: "Basic Navigation: Child Nodes",
  //   description: "Most nodes have children nodes, they can be viewed by clicking the same button for parent nodes.",
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  {
    targetId: "01",
    childTargetId: "01-children-list",
    title: "Basic Navigation: Child Nodes",
    description: "You can see the children nodes listed below in this panel.",
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  {
    targetId: "01",
    childTargetId: "01-child-button-0", // TODO: add id-child-button-idx
    title: "Basic Navigation: Child Nodes",
    description: "By clicking a title, we are taken to the child node.",
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  {
    targetId: "01",
    childTargetId: "01-children-list",
    title: "Basic Navigation: Learning Pathway",
    description: "By clicking a title, we are taken to the child node.",
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
];
