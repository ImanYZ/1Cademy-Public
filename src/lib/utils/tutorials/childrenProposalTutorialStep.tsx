import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { TutorialStepConfig } from "src/nodeBookTypes";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { getBaseStepConfig } from "./tutorial.utils";

dayjs.extend(relativeTime);

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
          "Concept nodes should be a single concept that is defined. It is important that a clear definition is provided and that more than one concept is not being defined."
        }
      />
    ),
    isClickeable: true,
  },
];
const CHILD_RELATION_PROPOSAL_STEPS: TutorialStepConfig[] = [
  {
    title: "Proposing Child Relation Node",
    description: (
      <MarkdownRender
        text={
          "Relation nodes should contain multiple concepts, but they are not defined. A common arrangement of concepts is a concept node then a relation node covering a selection of specific concepts related to the first concept, and then each of those concepts defined in concept nodes coming off of the relation node."
        }
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
          "Reference nodes are what you use to cite a source in other node types (with the exception of idea and question nodes). In a reference node you just want the title of the source and its APA citation in the content. Page numbers, URLs, and time stamps are added when a reference node is cited by another node, they are not added into individual reference nodes."
        }
      />
    ),
    isClickeable: true,
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
          "Idea nodes are your own unique thoughts and do not need to cite a reference. There are a number of reasons to use one. This could include offering ideas for the arrangement of future nodes in an area, or offering some insights or theories based on information covered in previous nodes."
        }
      />
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
          "Code nodes are used to display a snippet of programming language code (Python, R, HTML, or JavaScript). They should have properly formatted code, and the programming language used should be identifiable."
        }
      />
    ),
    isClickeable: true,
  },
];

console.log({
  CHILD_CONCEPT_PROPOSAL_STEPS,
  CHILD_REFERENCE_PROPOSAL_STEPS,
  CHILD_RELATION_PROPOSAL_STEPS,
  CHILD_IDEA_PROPOSAL_STEPS,
  CHILD_QUESTION_PROPOSAL_STEPS,
  CHILD_CODE_PROPOSAL_STEPS,
});

export const CHILD_PROPOSAL_COMPLETE: TutorialStepConfig[] = CHILD_PROPOSAL_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
