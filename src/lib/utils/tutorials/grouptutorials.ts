import { GroupTutorial } from "../../../components/tutorial/TutorialTableOfContent";
import {
  CHILD_CODE_PROPOSAL_COMPLETE,
  CHILD_CONCEPT_PROPOSAL_COMPLETE,
  CHILD_IDEA_PROPOSAL_COMPLETE,
  CHILD_PROPOSAL_COMPLETE,
  CHILD_QUESTION_PROPOSAL_COMPLETE,
  CHILD_REFERENCE_PROPOSAL_COMPLETE,
  CHILD_RELATION_PROPOSAL_COMPLETE,
} from "./childrenProposalTutorialStep";
import { NAVIGATION_STEPS_COMPLETE } from "./navigationTutorialSteps";
import { HIDE_OFFSPRING_STEPS_COMPLETE } from "./nodeActionsTutorialStep";
import { NODE_CODE } from "./nodeCodeTutorialSteps";
import { NODE_CONCEPT } from "./nodeConceptTutorialStep";
import { NODE_IDEA } from "./nodeIdeaTutorialSteps";
import { NODE_QUESTION } from "./nodeQuestionStepTutorialStep";
import { NODE_REFERENCE } from "./nodeReferenceTutorialSteps";
import { NODE_RELATION } from "./nodeRelationTutorialSteps";
import { NODES_STEPS_COMPLETE } from "./nodeTutorialSteps";
import { PROPOSING_CODE_EDIT_COMPLETE } from "./proposalCodeTutorialStep";
import { PROPOSING_CONCEPT_EDIT_COMPLETE } from "./proposalConceptTutorialStep";
import { PROPOSING_IDEA_EDIT_COMPLETE } from "./proposalIdeaTutorialSteps";
import { PROPOSING_QUESTION_EDIT_COMPLETE } from "./proposalQuestionTutorialSteps";
import { PROPOSING_REFERENCE_EDIT_COMPLETE } from "./proposalReferenceTutorialSteps";
import { PROPOSING_RELATION_EDIT_COMPLETE } from "./proposalRelationTutorialSteps";
import { PROPOSAL_STEPS_COMPLETE } from "./proposalTutorialSteps";
import {
  RECONCILING_ACCEPTED_PROPOSALS_STEPS_COMPLETE,
  RECONCILING_NOT_ACCEPTED_PROPOSALS_STEPS_COMPLETE,
} from "./reconcilingProposalsTutorialSteps";
import { SEARCHER_STEPS_COMPLETE } from "./searcherTutorialSteps";

export const GROUP_TUTORIALS: GroupTutorial[] = [
  {
    title: "Basics",
    tutorials: [
      {
        title: "Navigation",
        tutorialSteps: { tutorialKey: "navigation", steps: NAVIGATION_STEPS_COMPLETE },
        tutorials: [],
      },
      {
        title: "Nodes",
        tutorialSteps: { tutorialKey: "nodes", steps: NODES_STEPS_COMPLETE },
        tutorials: [],
      },
      {
        title: "Searcher",
        tutorialSteps: { tutorialKey: "searcher", steps: SEARCHER_STEPS_COMPLETE },
        tutorials: [],
      },
      {
        title: "Hide offsprings",
        tutorialSteps: { tutorialKey: "hideOffsprings", steps: HIDE_OFFSPRING_STEPS_COMPLETE },
        tutorials: [],
      },
    ],
  },
  {
    title: "Node Types",
    tutorials: [
      {
        title: "Concept Node",
        tutorialSteps: { tutorialKey: "concept", steps: NODE_CONCEPT },
        tutorials: [],
      },
      {
        title: "Relation Node",
        tutorialSteps: { tutorialKey: "relation", steps: NODE_RELATION },
        tutorials: [],
      },
      {
        title: "Reference Node",
        tutorialSteps: { tutorialKey: "reference", steps: NODE_REFERENCE },
        tutorials: [],
      },
      {
        title: "Question Node",
        tutorialSteps: { tutorialKey: "question", steps: NODE_QUESTION },
        tutorials: [],
      },
      {
        title: "Code Node",
        tutorialSteps: { tutorialKey: "code", steps: NODE_CODE },
        tutorials: [],
      },
      {
        title: "Idea Node",
        tutorialSteps: { tutorialKey: "idea", steps: NODE_IDEA },
        tutorials: [],
      },
    ],
  },
  {
    title: "Proposal",
    tutorials: [
      {
        title: "Proposing Edit",
        tutorialSteps: { tutorialKey: "proposal", steps: PROPOSAL_STEPS_COMPLETE },
        tutorials: [],
      },
      {
        title: "Edit Node Types",
        tutorials: [
          {
            title: "Edit Concept Node",
            tutorialSteps: { tutorialKey: "proposalConcept", steps: PROPOSING_CONCEPT_EDIT_COMPLETE },
            tutorials: [],
          },
          {
            title: "Edit Relation Node",
            tutorialSteps: { tutorialKey: "proposalRelation", steps: PROPOSING_RELATION_EDIT_COMPLETE },
            tutorials: [],
          },
          {
            title: "Edit Reference Node",
            tutorialSteps: { tutorialKey: "proposalReference", steps: PROPOSING_REFERENCE_EDIT_COMPLETE },
            tutorials: [],
          },
          {
            title: "Edit Question Node",
            tutorialSteps: { tutorialKey: "proposalQuestion", steps: PROPOSING_QUESTION_EDIT_COMPLETE },
            tutorials: [],
          },
          {
            title: "Edit Code Node",
            tutorials: [],
            tutorialSteps: { tutorialKey: "proposalCode", steps: PROPOSING_CODE_EDIT_COMPLETE },
          },
          {
            title: "Edit Idea Node",
            tutorialSteps: { tutorialKey: "proposalIdea", steps: PROPOSING_IDEA_EDIT_COMPLETE },
            tutorials: [],
          },
        ],
      },
      {
        title: "New node types",
        tutorialSteps: { tutorialKey: "childProposal", steps: CHILD_PROPOSAL_COMPLETE },
        tutorials: [
          {
            title: "New Concept Node",
            tutorialSteps: { tutorialKey: "childConcept", steps: CHILD_CONCEPT_PROPOSAL_COMPLETE },
            tutorials: [],
          },
          {
            title: "New Relation Node",
            tutorialSteps: { tutorialKey: "childRelation", steps: CHILD_RELATION_PROPOSAL_COMPLETE },
            tutorials: [],
          },
          {
            title: "New Reference Node",
            tutorialSteps: { tutorialKey: "childReference", steps: CHILD_REFERENCE_PROPOSAL_COMPLETE },
            tutorials: [],
          },
          {
            title: "New Question Node",
            tutorialSteps: { tutorialKey: "childQuestion", steps: CHILD_QUESTION_PROPOSAL_COMPLETE },
            tutorials: [],
          },
          {
            title: "New Code Node",
            tutorials: [],
            tutorialSteps: { tutorialKey: "childCode", steps: CHILD_CODE_PROPOSAL_COMPLETE },
          },
          {
            title: "New Idea Node",
            tutorialSteps: { tutorialKey: "childIdea", steps: CHILD_IDEA_PROPOSAL_COMPLETE },
            tutorials: [],
          },
        ],
      },
      {
        title: "Reconciling",
        tutorials: [
          {
            title: "Reconciling Accepted Proposals",
            tutorialSteps: {
              tutorialKey: "reconcilingAcceptedProposal",
              steps: RECONCILING_ACCEPTED_PROPOSALS_STEPS_COMPLETE,
            },
            tutorials: [],
          },
          {
            title: "Reconciling Not Accepted Proposal",
            tutorialSteps: {
              tutorialKey: "reconcilingNotAcceptedProposal",
              steps: RECONCILING_NOT_ACCEPTED_PROPOSALS_STEPS_COMPLETE,
            },
            tutorials: [],
          },
        ],
      },
      {
        title: "Siderbars",
        tutorials: [
          {
            title: "Searcher",
            tutorialSteps: { tutorialKey: "searcher", steps: SEARCHER_STEPS_COMPLETE },
            tutorials: [],
          },
        ],
      },
    ],
  },
];
