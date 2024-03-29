import { GroupTutorial } from "../../../components/tutorial/TutorialTableOfContent";
import { BOOKMARKS_STEPS } from "./bookmarksTutorialSteps";
import { KNOWLEDGE_GRAPH_CONFIG } from "./knowledgeGraphSteps";
import { LEADER_BOARD_STEPS } from "./leaderBoardTutorialSteps";
// import { INTERACTION_LIVENESS_BAR_STEPS, REPUTATION_LIVENESS_BAR_STEPS } from "./livenessBarTutorialSteps";
import { NAVIGATION_STEPS_COMPLETE } from "./navigationTutorialSteps";
import {
  // COLLAPSE_STEPS_COMPLETE,
  DOWNVOTE_STEPS_COMPLETE,
  // EXPAND_STEPS_COMPLETE,
  // HIDE_OFFSPRING_STEPS_COMPLETE,
  // HIDE_STEPS_COMPLETE,
  TAGS_REFERENCES_STEPS_COMPLETE,
  UPTOVE_STEPS_COMPLETE,
} from "./nodeActionsTutorialStep";
import { NODE_CODE } from "./nodeCodeTutorialSteps";
import { NODE_CONCEPT } from "./nodeConceptTutorialStep";
import { NODE_IDEA } from "./nodeIdeaTutorialSteps";
import { NODE_INTERACTIONS_CONFIG } from "./nodeInteractionsSteps";
import { NODE_QUESTION } from "./nodeQuestionStepTutorialStep";
import { NODE_REFERENCE } from "./nodeReferenceTutorialSteps";
import { NODE_RELATION } from "./nodeRelationTutorialSteps";
import { NODES_STEPS_COMPLETE } from "./nodeTutorialSteps";
import { NOTIFICATION_STEPS } from "./notificationsTutorialSteps";
import { PARENTS_CHILDREN_LIST_STEPS } from "./parentChildrenListTutorialSteps";
import { PATHWAYS_STEPS } from "./pathwaysTutorialSteps";
import { PENDING_PROPOSALS_STEPS_COMPLETE } from "./pendingProposalsTutorial";
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
import { USER_INFO_STEPS_COMPLETE } from "./userInfoTutorialSteps";
import { USER_SETTINGS_STEPS_COMPLETE } from "./userSettingsTutorialSteps";

export type LivelinessBar = "interaction" | "reputation" | null;

type GetGroupTutorialsInput = {
  livelinessBar: LivelinessBar;
};

export const getGroupTutorials = ({}: GetGroupTutorialsInput): GroupTutorial[] => [
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
        title: "The Knowledge Graph",
        tutorialSteps: { tutorialKey: "knowledgeGraph", steps: KNOWLEDGE_GRAPH_CONFIG },
        tutorials: [],
      },
      {
        title: "Node Interactions",
        tutorialSteps: { tutorialKey: "nodeInteractions", steps: NODE_INTERACTIONS_CONFIG },
        tutorials: [],
      },
      // {
      //   title: "Hide Descendants",
      //   tutorialSteps: { tutorialKey: "hideDescendants", steps: HIDE_OFFSPRING_STEPS_COMPLETE },
      //   tutorials: [],
      // },
      // {
      //   title: "Collapse the Node",
      //   tutorialSteps: { tutorialKey: "collapseNode", steps: COLLAPSE_STEPS_COMPLETE },
      //   tutorials: [],
      // },
      // {
      //   title: "Expand the Node",
      //   tutorialSteps: { tutorialKey: "expandNode", steps: EXPAND_STEPS_COMPLETE },
      //   tutorials: [],
      // },
      // {
      //   title: "Hide the Node",
      //   tutorialSteps: { tutorialKey: "hideNode", steps: HIDE_STEPS_COMPLETE },
      //   tutorials: [],
      // },
      {
        title: "Search Engine",
        tutorialSteps: { tutorialKey: "searcher", steps: SEARCHER_STEPS_COMPLETE },
        tutorials: [],
      },
    ],
  },
  // {
  //   title: "Notebooks",
  //   tutorials: [
  //     {
  //       title: "Notebooks",
  //       tutorialSteps: { tutorialKey: "notebooks", steps: NOTEBOOKS_STEPS },
  //       tutorials: [],
  //     },
  //   ],
  // },
  {
    title: "Learning Pathways",
    tutorials: [
      {
        title: "Links to Parents/Children",
        tutorialSteps: { tutorialKey: "parentsChildrenList", steps: PARENTS_CHILDREN_LIST_STEPS },
        tutorials: [],
      },
      {
        title: "Cited Tags and References",
        tutorialSteps: { tutorialKey: "tagsReferences", steps: TAGS_REFERENCES_STEPS_COMPLETE },
        tutorials: [],
      },
      {
        title: "Learning Pathways",
        tutorialSteps: { tutorialKey: "pathways", steps: PATHWAYS_STEPS },
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
    title: "Evaluation",
    tutorials: [
      {
        title: "Upvoting Helpful Content",
        tutorialSteps: { tutorialKey: "upVote", steps: UPTOVE_STEPS_COMPLETE },
        tutorials: [],
      },
      {
        title: "Downvoting to Delete Content",
        tutorialSteps: { tutorialKey: "downVote", steps: DOWNVOTE_STEPS_COMPLETE },
        tutorials: [],
      },
    ],
  },

  {
    title: "Proposals",
    tutorials: [
      {
        title: "Proposing Edits",
        tutorialSteps: { tutorialKey: "proposal", steps: PROPOSAL_STEPS_COMPLETE },
        tutorials: [],
      },
      {
        title: "Reconciling Approved Proposals",
        tutorialSteps: {
          tutorialKey: "reconcilingAcceptedProposal",
          steps: RECONCILING_ACCEPTED_PROPOSALS_STEPS_COMPLETE,
        },
        tutorials: [],
      },
      {
        title: "Reconciling Pending Proposal",
        tutorialSteps: {
          tutorialKey: "reconcilingNotAcceptedProposal",
          steps: RECONCILING_NOT_ACCEPTED_PROPOSALS_STEPS_COMPLETE,
        },
        tutorials: [],
      },
    ],
  },
  {
    title: "Proposing Edits",
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
  // {
  //   title: "Proposing New Nodes",
  //   tutorials: [
  //     {
  //       title: "New Concept Node",
  //       tutorialSteps: { tutorialKey: "childConcept", steps: CHILD_CONCEPT_PROPOSAL_COMPLETE },
  //       tutorials: [],
  //     },
  //     {
  //       title: "New Relation Node",
  //       tutorialSteps: { tutorialKey: "childRelation", steps: CHILD_RELATION_PROPOSAL_COMPLETE },
  //       tutorials: [],
  //     },
  //     {
  //       title: "New Reference Node",
  //       tutorialSteps: { tutorialKey: "childReference", steps: CHILD_REFERENCE_PROPOSAL_COMPLETE },
  //       tutorials: [],
  //     },
  //     {
  //       title: "New Question Node",
  //       tutorialSteps: { tutorialKey: "childQuestion", steps: CHILD_QUESTION_PROPOSAL_COMPLETE },
  //       tutorials: [],
  //     },
  //     {
  //       title: "New Code Node",
  //       tutorials: [],
  //       tutorialSteps: { tutorialKey: "childCode", steps: CHILD_CODE_PROPOSAL_COMPLETE },
  //     },
  //     {
  //       title: "New Idea Node",
  //       tutorialSteps: { tutorialKey: "childIdea", steps: CHILD_IDEA_PROPOSAL_COMPLETE },
  //       tutorials: [],
  //     },
  //   ],
  // },
  {
    title: "Siderbars",
    tutorials: [
      {
        title: "User Settings",
        tutorialSteps: { tutorialKey: "userSettings", steps: USER_SETTINGS_STEPS_COMPLETE },
        tutorials: [],
      },
      // CHECK: if is required to have search engine in 2 places, add a key to differentiate them
      // {
      //   title: "Search Engine",
      //   tutorialSteps: { tutorialKey: "searcher", steps: SEARCHER_STEPS_COMPLETE },
      //   tutorials: [],
      // },
      {
        title: "Notifications",
        tutorialSteps: { tutorialKey: "notifications", steps: NOTIFICATION_STEPS },
        tutorials: [],
      },
      {
        title: "Bookmarks",
        tutorialSteps: { tutorialKey: "bookmarks", steps: BOOKMARKS_STEPS },
        tutorials: [],
      },

      {
        title: "Pending Proposals",
        tutorialSteps: { tutorialKey: "pendingProposals", steps: PENDING_PROPOSALS_STEPS_COMPLETE },
        tutorials: [],
      },
      {
        title: "User Mini-Profiles",
        tutorialSteps: { tutorialKey: "userInfo", steps: USER_INFO_STEPS_COMPLETE },
        tutorials: [],
      },
      {
        title: "Leaderboards",
        tutorialSteps: { tutorialKey: "leaderBoard", steps: LEADER_BOARD_STEPS },
        tutorials: [],
      },
    ],
  },
  // {
  //   title: "Building Reputation",
  //   tutorials: [
  //     ...getLivelinessBar(livelinessBar),
  //     {
  //       title: "Community Leaderboard",
  //       tutorialSteps: { tutorialKey: "communityLeaderBoard", steps: COMMUNITY_LEADER_BOARD_STEPS },
  //       tutorials: [],
  //     },
  //   ],
  // },
];

// const getLivelinessBar = (livelinessBar: LivelinessBar): GroupTutorial[] => {
//   if (livelinessBar === "reputation")
//     return [
//       {
//         title: "Reputation Liveliness Bar",
//         tutorialSteps: { tutorialKey: "reputationLivenessBar", steps: REPUTATION_LIVENESS_BAR_STEPS },
//         tutorials: [],
//       },
//     ];

//   if (livelinessBar === "interaction")
//     return [
//       {
//         title: "Interaction Liveliness Bar",
//         tutorialSteps: { tutorialKey: "interactionLivenessBar", steps: INTERACTION_LIVENESS_BAR_STEPS },
//         tutorials: [],
//       },
//     ];

//   return [];
// };
