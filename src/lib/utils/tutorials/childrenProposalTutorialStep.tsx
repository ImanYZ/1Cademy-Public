import { TutorialStep, TutorialStepConfig } from "src/nodeBookTypes";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { getBaseStepConfig } from "./tutorial.utils";

const PROPOSE_CONCEPT_NODES_STEPS: TutorialStepConfig[] = [
  {
    title: "To Propose a ",
    description: <MarkdownRender text={"To Propose a concept child node, click on concept icon button"} />,
    isClickeable: true,
  },
];

const CHILD_PROPOSAL_STEPS: TutorialStepConfig[] = [
  {
    title: "Proposing Child Nodes",
    description: (
      <MarkdownRender
        text={
          "While you are making a node, you cannot add further children nodes or parent nodes to it. All nodes are made individually and further nodes are added through the same process of proposing an edit to an existing prerequisite node and selecting to add a new node."
        }
      />
    ),
    isClickeable: true,
  },
  {
    title: "Proposing Child Nodes",
    description: (
      <MarkdownRender
        text={
          "You also cannot propose to add a parent node. All new nodes are added as children nodes. However, you can edit parent/child links in a node which can allow you add an existing node as a parent to another existing node."
        }
      />
    ),
    isClickeable: true,
  },
];

const CHILD_CONCEPT_PROPOSAL_STEPS: TutorialStepConfig[] = [
  {
    title: "Proposing Child Concept Node",
    description: (
      <MarkdownRender
        text={
          "In this form you can create a concept node. It has all the same fields as editing a node. Concept nodes should be a single concept that is defined. It is important that a clear definition is provided and that more than one concept is not being defined."
        }
      />
    ),
  },
  {
    title: "Proposing Child Concept Node",
    description: (
      <MarkdownRender
        text={"Before you hit the propose button make sure that you link a reference node as a citation."}
      />
    ),
  },
];

const CHILD_RELATION_PROPOSAL_STEPS: TutorialStepConfig[] = [
  {
    title: "Proposing Child Relation Node",
    description: (
      <MarkdownRender
        text={
          "In this form you can create a relation node. It has all the same fields as editing a node. Relation nodes should contain multiple concepts, but they are not defined. A common arrangement of concepts is a concept node then a relation node covering a selection of specific concepts related to the first concept, and then each of those concepts defined in concept nodes coming off of the relation node."
        }
      />
    ),
    isClickeable: true,
  },
  {
    title: "Proposing Child Relation Node",
    description: (
      <MarkdownRender
        text={"Before you hit the propose button make sure that you link a reference node as a citation."}
      />
    ),
    isClickeable: true,
  },
];

const CHILD_REFERENCE_PROPOSAL_STEPS: TutorialStepConfig[] = [
  {
    title: "Proposing Child Reference Node",
    description: (
      <MarkdownRender
        text={
          "In this form you can create a reference node. It has all the same fields as editing a node. Reference nodes are what you use to cite a source in other node types (with the exception of idea and question nodes). In a reference node you just want the title of the source and its APA citation in the content. Page numbers, URLs, and time stamps are added when a reference node is cited by another node, they are not added into individual reference nodes."
        }
      />
    ),
  },
  {
    title: "Proposing Child Reference Node",
    description: (
      <MarkdownRender
        text={
          "Before adding a concept or relation node, you will typically want to make the reference node for the source you will be citing. Once you have made the reference node, you can click on it when you are prompted to when you are adding a citation to your concept or relation node."
        }
      />
    ),
  },
];

const CHILD_QUESTION_PROPOSAL_STEPS: TutorialStepConfig[] = [
  {
    title: "Proposing Child Question Node",
    description: (
      <MarkdownRender
        text={
          "Question nodes are intended to help learning. They are used to quiz people on the concepts covered in nodes. It should be a multiple choice question with one or more correct answers. If you do not know an aspect of how 1Cademy works or the content of a node, do not use a question node for clarification. Instead, you should talk to your community leader."
        }
      />
    ),
    isClickeable: true,
  },
];

const CHILD_IDEA_PROPOSAL_STEPS: TutorialStepConfig[] = [
  {
    title: "Proposing Child Idea Node",
    description: (
      <MarkdownRender
        text={
          "In this form you can create an idea node. It has all the same fields as editing a node. There are a number of reasons to use one. This could include offering ideas for the arrangement of future nodes in an area, or offering some insights or theories based on information covered in previous nodes."
        }
      />
    ),
    isClickeable: true,
  },
  {
    title: "Proposing Child Idea Node",
    description: (
      <MarkdownRender text={"Because an idea node contains your own ideas, you do not need to add a citation."} />
    ),
    isClickeable: true,
  },
];

const CHILD_CODE_PROPOSAL_STEPS: TutorialStepConfig[] = [
  {
    title: "Proposing Child Code Node",
    description: (
      <MarkdownRender
        text={
          "In this form you can create a code node. It has all the same fields as editing a node. Code nodes are used to display a snippet of programming language code (Python, R, HTML, or JavaScript). They should have properly formatted code, and the programming language used should be identifiable."
        }
      />
    ),
    isClickeable: true,
  },
  {
    title: "Proposing Child Code Node",
    description: (
      <MarkdownRender
        text={"Before you hit the propose button make sure that you link a reference node as a citation."}
      />
    ),
    isClickeable: true,
  },
];

export const CHILD_PROPOSAL_COMPLETE: TutorialStep[] = CHILD_PROPOSAL_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});

export const PROPOSE_CONCEPT_NODES_COMPLETE: TutorialStep[] = PROPOSE_CONCEPT_NODES_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});

export const CHILD_CONCEPT_PROPOSAL_COMPLETE: TutorialStep[] = CHILD_CONCEPT_PROPOSAL_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});

export const CHILD_RELATION_PROPOSAL_COMPLETE: TutorialStep[] = CHILD_RELATION_PROPOSAL_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const CHILD_REFERENCE_PROPOSAL_COMPLETE: TutorialStep[] = CHILD_REFERENCE_PROPOSAL_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const CHILD_IDEA_PROPOSAL_COMPLETE: TutorialStep[] = CHILD_IDEA_PROPOSAL_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const CHILD_QUESTION_PROPOSAL_COMPLETE: TutorialStep[] = CHILD_QUESTION_PROPOSAL_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
export const CHILD_CODE_PROPOSAL_COMPLETE: TutorialStep[] = CHILD_CODE_PROPOSAL_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
