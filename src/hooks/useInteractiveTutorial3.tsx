import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { KNOWLEDGE_GRAPH_CONFIG } from "@/lib/utils/tutorials/knowledgeGraphSteps";
import { NAVIGATION_STEPS_COMPLETE } from "@/lib/utils/tutorials/navigationTutorialSteps";
import {
  COLLAPSE_STEPS_COMPLETE,
  EXPAND_STEPS_COMPLETE,
  HIDE_STEPS_COMPLETE,
  TAGS_REFERENCES_STEPS_COMPLETE,
} from "@/lib/utils/tutorials/nodeActionsTutorialStep";
import { HIDE_OFFSPRING_STEPS_COMPLETE } from "@/lib/utils/tutorials/nodeActionsTutorialStep";
import { NODE_INTERACTIONS_CONFIG } from "@/lib/utils/tutorials/nodeInteractionsSteps";
import { PENDING_PROPOSALS_STEPS_COMPLETE } from "@/lib/utils/tutorials/pendingProposalsTutorial";
import { PROPOSAL_STEPS_COMPLETE } from "@/lib/utils/tutorials/proposalTutorialSteps";
import {
  RECONCILING_ACCEPTED_PROPOSALS_STEPS_COMPLETE,
  RECONCILING_NOT_ACCEPTED_PROPOSALS_STEPS_COMPLETE,
} from "@/lib/utils/tutorials/reconcilingProposalsTutorialSteps";
import { SEARCHER_STEPS_COMPLETE } from "@/lib/utils/tutorials/searcherTutorialSteps";
import { TOOLBOX_STEPS } from "@/lib/utils/tutorials/toolbooxTutorialSteps";
import { USER_INFO_STEPS_COMPLETE } from "@/lib/utils/tutorials/userInfoTutorialSteps";
import { USER_SETTINGS_STEPS_COMPLETE } from "@/lib/utils/tutorials/userSettingsTutorialSteps";

import { User } from "../knowledgeTypes";
import { devLog } from "../lib/utils/develop.util";
import { BOOKMARKS_STEPS } from "../lib/utils/tutorials/bookmarksTutorialSteps";
import { CHILD_PROPOSAL_COMPLETE } from "../lib/utils/tutorials/childrenProposalTutorialStep";
import { COMMUNITY_LEADER_BOARD_STEPS } from "../lib/utils/tutorials/communityLeaderBoardTutorialSteps";
import { LEADER_BOARD_STEPS } from "../lib/utils/tutorials/leaderBoardTutorialSteps";
import {
  INTERACTION_LIVENESS_BAR_STEPS,
  REPUTATION_LIVENESS_BAR_STEPS,
} from "../lib/utils/tutorials/livenessBarTutorialSteps";
import { DOWNVOTE_STEPS_COMPLETE, UPTOVE_STEPS_COMPLETE } from "../lib/utils/tutorials/nodeActionsTutorialStep";
import { NODE_CODE } from "../lib/utils/tutorials/nodeCodeTutorialSteps";
import { NODE_CONCEPT } from "../lib/utils/tutorials/nodeConceptTutorialStep";
import { NODE_IDEA } from "../lib/utils/tutorials/nodeIdeaTutorialSteps";
import { NODE_QUESTION } from "../lib/utils/tutorials/nodeQuestionStepTutorialStep";
import { NODE_REFERENCE } from "../lib/utils/tutorials/nodeReferenceTutorialSteps";
import { NODE_RELATION } from "../lib/utils/tutorials/nodeRelationTutorialSteps";
import { NODES_STEPS_COMPLETE } from "../lib/utils/tutorials/nodeTutorialSteps";
import { NOTIFICATION_STEPS } from "../lib/utils/tutorials/notificationsTutorialSteps";
import { PARENTS_CHILDREN_LIST_STEPS } from "../lib/utils/tutorials/parentChildrenListTutorialSteps";
import { PATHWAYS_STEPS } from "../lib/utils/tutorials/pathwaysTutorialSteps";
import { PROPOSING_CODE_EDIT_COMPLETE } from "../lib/utils/tutorials/proposalCodeTutorialStep";
import { PROPOSING_CONCEPT_EDIT_COMPLETE } from "../lib/utils/tutorials/proposalConceptTutorialStep";
import { PROPOSING_IDEA_EDIT_COMPLETE } from "../lib/utils/tutorials/proposalIdeaTutorialSteps";
import { PROPOSING_QUESTION_EDIT_COMPLETE } from "../lib/utils/tutorials/proposalQuestionTutorialSteps";
import { PROPOSING_REFERENCE_EDIT_COMPLETE } from "../lib/utils/tutorials/proposalReferenceTutorialSteps";
import { PROPOSING_RELATION_EDIT_COMPLETE } from "../lib/utils/tutorials/proposalRelationTutorialSteps";
import {
  TMP_EDIT_NODE,
  TMP_OPEN_PARENT_CHILDREN,
  TMP_PATHWAYS,
  TMP_PROPOSE_CHILD_CODE,
  TMP_PROPOSE_CHILD_CONCEPT,
  TMP_PROPOSE_CHILD_IDEA,
  TMP_PROPOSE_CHILD_QUESTION,
  TMP_PROPOSE_CHILD_REFERENCE,
  TMP_PROPOSE_CHILD_RELATION,
  TMP_TAGS_REFERENCES,
} from "../lib/utils/tutorials/temporalTutorialSteps";
import { TutorialStep, TutorialTypeKeys, UserTutorials } from "../nodeBookTypes";

export const DEFAULT_NUMBER_OF_TRIES = 5;

type useInteractiveTutorialProps = {
  user: User | null;
};

export type Tutorial = { name: TutorialTypeKeys; steps: TutorialStep[]; step: number } | null;

export const useInteractiveTutorial = ({ user }: useInteractiveTutorialProps) => {
  const db = getFirestore();
  const isPlayingTheTutorialRef = useRef(false);
  // const [currentStep, setCurrentStep] = useState<TutorialStep | null>(null);
  const [tutorial, setTutorial] = useState<Tutorial>(null);
  // this target will have the id of the html element which has the correct state in the required moment
  const [dynamicTargetId, setDynamicTargetId] = useState("");
  // const [initialStep, setInitialStep] = useState(0);

  const [userTutorial, setUserTutorial] = useState<UserTutorials>({
    navigation: { currentStep: -1, done: false, skipped: false },
    nodes: { currentStep: -1, done: false, skipped: false },
    searcher: { currentStep: -1, done: false, skipped: false },
    concept: { currentStep: -1, done: false, skipped: false },
    relation: { currentStep: -1, done: false, skipped: false },
    reference: { currentStep: -1, done: false, skipped: false },
    question: { currentStep: -1, done: false, skipped: false },
    idea: { currentStep: -1, done: false, skipped: false },
    code: { currentStep: -1, done: false, skipped: false },
    proposal: { currentStep: -1, done: false, skipped: false },
    proposalConcept: { currentStep: -1, done: false, skipped: false },
    proposalRelation: { currentStep: -1, done: false, skipped: false },
    proposalReference: { currentStep: -1, done: false, skipped: false },
    proposalIdea: { currentStep: -1, done: false, skipped: false },
    proposalQuestion: { currentStep: -1, done: false, skipped: false },
    proposalCode: { currentStep: -1, done: false, skipped: false },
    reconcilingAcceptedProposal: { currentStep: -1, done: false, skipped: false },
    reconcilingNotAcceptedProposal: { currentStep: -1, done: false, skipped: false },
    childProposal: { currentStep: -1, done: false, skipped: false },
    childConcept: { currentStep: -1, done: false, skipped: false },
    childRelation: { currentStep: -1, done: false, skipped: false },
    childReference: { currentStep: -1, done: false, skipped: false },
    childQuestion: { currentStep: -1, done: false, skipped: false },
    childIdea: { currentStep: -1, done: false, skipped: false },
    childCode: { currentStep: -1, done: false, skipped: false },
    tmpEditNode: { currentStep: -1, done: false, skipped: false },
    tmpProposalConceptChild: { currentStep: -1, done: false, skipped: false },
    tmpProposalRelationChild: { currentStep: -1, done: false, skipped: false },
    tmpProposalReferenceChild: { currentStep: -1, done: false, skipped: false },
    tmpProposalQuestionChild: { currentStep: -1, done: false, skipped: false },
    tmpProposalIdeaChild: { currentStep: -1, done: false, skipped: false },
    tmpProposalCodeChild: { currentStep: -1, done: false, skipped: false },
    tmpTagsReferences: { currentStep: -1, done: false, skipped: false },
    tmpParentsChildrenList: { currentStep: -1, done: false, skipped: false },
    tmpPathways: { currentStep: -1, done: false, skipped: false },
    toolbox: { currentStep: -1, done: false, skipped: false },
    collapseNode: { currentStep: -1, done: false, skipped: false },
    expandNode: { currentStep: -1, done: false, skipped: false },
    upVote: { currentStep: -1, done: false, skipped: false },
    downVote: { currentStep: -1, done: false, skipped: false },
    hideDescendants: { currentStep: -1, done: false, skipped: false },
    hideNode: { currentStep: -1, done: false, skipped: false },
    userSettings: { currentStep: -1, done: false, skipped: false },
    notifications: { currentStep: -1, done: false, skipped: false },
    bookmarks: { currentStep: -1, done: false, skipped: false },
    // notebooks: { currentStep: -1, done: false, skipped: false },
    leaderBoard: { currentStep: -1, done: false, skipped: false },
    pendingProposals: { currentStep: -1, done: false, skipped: false },
    reputationLivenessBar: { currentStep: -1, done: false, skipped: false },
    interactionLivenessBar: { currentStep: -1, done: false, skipped: false },
    userInfo: { currentStep: -1, done: false, skipped: false },
    communityLeaderBoard: { currentStep: -1, done: false, skipped: false },
    tagsReferences: { currentStep: -1, done: false, skipped: false },
    parentsChildrenList: { currentStep: -1, done: false, skipped: false },
    pathways: { currentStep: -1, done: false, skipped: false },
    knowledgeGraph: { currentStep: -1, done: false, skipped: false },
    nodeInteractions: { currentStep: -1, done: false, skipped: false },
  });

  // flag for whether tutorial state was loaded
  const [userTutorialLoaded, setUserTutorialLoaded] = useState(false);

  useEffect(() => {
    /**
     * fetch user tutorial state first time
     */
    if (!user) return;
    if (userTutorialLoaded) return;

    devLog("USE_EFFECT: FETCH_USER_TUTORIAL", { userTutorialLoaded, user });
    const getTutorialState = async () => {
      const tutorialRef = doc(db, "userTutorial", user.uname);
      const tutorialDoc = await getDoc(tutorialRef);

      if (tutorialDoc.exists()) {
        const tutorial = tutorialDoc.data() as UserTutorials;
        setUserTutorial(prev => ({ ...prev, ...tutorial }));
      }

      setUserTutorialLoaded(true);
    };

    getTutorialState();
  }, [db, user, userTutorialLoaded]);

  const startTutorial = useCallback((newTutorial: TutorialTypeKeys) => {
    let newSteps: TutorialStep[] = [];
    if (newTutorial === "navigation") {
      newSteps = NAVIGATION_STEPS_COMPLETE;
    }
    if (newTutorial === "nodes") {
      newSteps = NODES_STEPS_COMPLETE;
    }
    if (newTutorial === "concept") {
      newSteps = NODE_CONCEPT;
    }
    if (newTutorial === "relation") {
      newSteps = NODE_RELATION;
    }
    if (newTutorial === "reference") {
      newSteps = NODE_REFERENCE;
    }
    if (newTutorial === "question") {
      newSteps = NODE_QUESTION;
    }
    if (newTutorial === "idea") {
      newSteps = NODE_IDEA;
    }
    if (newTutorial === "code") {
      newSteps = NODE_CODE;
    }
    if (newTutorial === "proposal") {
      newSteps = PROPOSAL_STEPS_COMPLETE;
    }
    if (newTutorial === "proposalConcept") {
      newSteps = PROPOSING_CONCEPT_EDIT_COMPLETE;
    }
    if (newTutorial === "proposalReference") {
      newSteps = PROPOSING_REFERENCE_EDIT_COMPLETE;
    }
    if (newTutorial === "proposalRelation") {
      newSteps = PROPOSING_RELATION_EDIT_COMPLETE;
    }
    if (newTutorial === "proposalIdea") {
      newSteps = PROPOSING_IDEA_EDIT_COMPLETE;
    }
    if (newTutorial === "proposalQuestion") {
      newSteps = PROPOSING_QUESTION_EDIT_COMPLETE;
    }
    if (newTutorial === "proposalCode") {
      newSteps = PROPOSING_CODE_EDIT_COMPLETE;
    }
    if (newTutorial === "reconcilingAcceptedProposal") {
      newSteps = RECONCILING_ACCEPTED_PROPOSALS_STEPS_COMPLETE;
    }
    if (newTutorial === "reconcilingNotAcceptedProposal") {
      newSteps = RECONCILING_NOT_ACCEPTED_PROPOSALS_STEPS_COMPLETE;
    }
    if (newTutorial === "childProposal") {
      newSteps = CHILD_PROPOSAL_COMPLETE;
    }
    if (newTutorial === "childConcept") {
      newSteps = PROPOSING_CONCEPT_EDIT_COMPLETE;
    }
    if (newTutorial === "childRelation") {
      newSteps = PROPOSING_RELATION_EDIT_COMPLETE;
    }
    if (newTutorial === "childReference") {
      newSteps = PROPOSING_REFERENCE_EDIT_COMPLETE;
    }
    if (newTutorial === "childQuestion") {
      newSteps = PROPOSING_QUESTION_EDIT_COMPLETE;
    }
    if (newTutorial === "childIdea") {
      newSteps = PROPOSING_IDEA_EDIT_COMPLETE;
    }
    if (newTutorial === "childCode") {
      newSteps = PROPOSING_CODE_EDIT_COMPLETE;
    }
    if (newTutorial === "toolbox") {
      newSteps = TOOLBOX_STEPS;
    }
    if (newTutorial === "collapseNode") {
      newSteps = COLLAPSE_STEPS_COMPLETE;
    }
    if (newTutorial === "expandNode") {
      newSteps = EXPAND_STEPS_COMPLETE;
    }

    if (newTutorial === "hideDescendants") {
      newSteps = HIDE_OFFSPRING_STEPS_COMPLETE;
    }

    // sidebars

    if (newTutorial === "searcher") {
      newSteps = SEARCHER_STEPS_COMPLETE;
      setDynamicTargetId("");
    }
    if (newTutorial === "userSettings") {
      newSteps = USER_SETTINGS_STEPS_COMPLETE;
    }

    if (newTutorial === "notifications") {
      newSteps = NOTIFICATION_STEPS;
    }

    if (newTutorial === "bookmarks") {
      newSteps = BOOKMARKS_STEPS;
    }

    if (newTutorial === "pendingProposals") {
      newSteps = PENDING_PROPOSALS_STEPS_COMPLETE;
    }
    if (newTutorial === "userInfo") {
      newSteps = USER_INFO_STEPS_COMPLETE;
    }
    if (newTutorial === "knowledgeGraph") {
      newSteps = KNOWLEDGE_GRAPH_CONFIG;
    }
    if (newTutorial === "nodeInteractions") {
      newSteps = NODE_INTERACTIONS_CONFIG;
    }

    // node actions

    if (newTutorial === "upVote") {
      newSteps = UPTOVE_STEPS_COMPLETE;
    }

    if (newTutorial === "downVote") {
      newSteps = DOWNVOTE_STEPS_COMPLETE;
    }

    if (newTutorial === "hideNode") {
      newSteps = HIDE_STEPS_COMPLETE;
    }
    // node footer actions

    if (newTutorial === "tagsReferences") {
      newSteps = TAGS_REFERENCES_STEPS_COMPLETE;
    }

    if (newTutorial === "tmpTagsReferences") {
      newSteps = TMP_TAGS_REFERENCES;
    }
    //----------------- tmp nodes

    if (newTutorial === "tmpEditNode") {
      newSteps = TMP_EDIT_NODE;
    }

    if (newTutorial === "tmpProposalConceptChild") {
      newSteps = TMP_PROPOSE_CHILD_CONCEPT;
    }
    if (newTutorial === "tmpProposalRelationChild") {
      newSteps = TMP_PROPOSE_CHILD_RELATION;
    }
    if (newTutorial === "tmpProposalReferenceChild") {
      newSteps = TMP_PROPOSE_CHILD_REFERENCE;
    }
    if (newTutorial === "tmpProposalQuestionChild") {
      newSteps = TMP_PROPOSE_CHILD_QUESTION;
    }
    if (newTutorial === "tmpProposalIdeaChild") {
      newSteps = TMP_PROPOSE_CHILD_IDEA;
    }
    if (newTutorial === "tmpProposalCodeChild") {
      newSteps = TMP_PROPOSE_CHILD_CODE;
    }
    if (newTutorial === "tmpParentsChildrenList") {
      newSteps = TMP_OPEN_PARENT_CHILDREN;
    }
    if (newTutorial === "tmpPathways") {
      newSteps = TMP_PATHWAYS;
    }
    // others
    // if (newTutorial === "notebooks") {
    //   newSteps = NOTEBOOKS_STEPS;
    // }
    if (newTutorial === "leaderBoard") {
      newSteps = LEADER_BOARD_STEPS;
    }

    if (newTutorial === "interactionLivenessBar") {
      newSteps = INTERACTION_LIVENESS_BAR_STEPS;
    }

    if (newTutorial === "reputationLivenessBar") {
      newSteps = REPUTATION_LIVENESS_BAR_STEPS;
    }

    if (newTutorial === "communityLeaderBoard") {
      newSteps = COMMUNITY_LEADER_BOARD_STEPS;
    }

    if (newTutorial === "parentsChildrenList") {
      newSteps = PARENTS_CHILDREN_LIST_STEPS;
    }

    if (newTutorial === "pathways") {
      newSteps = PATHWAYS_STEPS;
    }

    setUserTutorial(prev => ({
      ...prev,
      [newTutorial]: { ...prev[newTutorial], currentStep: 1 },
    }));

    setTutorial({ name: newTutorial, steps: newSteps, step: 1 });
  }, []);

  const currentStep = useMemo(() => getTutorialStep(tutorial), [tutorial]);

  const onNextStep = useCallback(() => {
    setTutorial(prevTutorial => {
      if (!prevTutorial) return null;
      if (!currentStep) return null;
      if (prevTutorial.step >= prevTutorial.steps.length) return prevTutorial;

      const newStep = prevTutorial.step + 1;
      setUserTutorial(prevUserTutorial => ({
        ...prevUserTutorial,
        [prevTutorial.name]: { ...prevUserTutorial[prevTutorial.name], currentStep: newStep },
      }));
      return { ...prevTutorial, step: newStep };
    });
  }, [currentStep]);

  const onPreviousStep = useCallback(() => {
    setTutorial(prevTutorial => {
      if (!prevTutorial) return null;
      if (!currentStep) return null;
      if (prevTutorial.step <= 1) return prevTutorial;

      const newStep = prevTutorial.step - 1;
      setUserTutorial(prevUserTutorial => ({
        ...prevUserTutorial,
        [prevTutorial.name]: { ...prevUserTutorial[prevTutorial.name], currentStep: newStep },
      }));
      return { ...prevTutorial, step: newStep };
    });
  }, [currentStep]);

  return {
    startTutorial,
    tutorial,
    setTutorial,
    currentStep,
    onNextStep,
    onPreviousStep,
    isPlayingTheTutorialRef,
    setDynamicTargetId,
    dynamicTargetId,
    userTutorial,
    userTutorialLoaded,
    setUserTutorial,
  };
};

export const STEPS_NODE_TUTORIAL = [];

const getTutorialStep = (tutorial: Tutorial) => {
  if (!tutorial) return null;
  return tutorial.steps[tutorial.step - 1];
};
