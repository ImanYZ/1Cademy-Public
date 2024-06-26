import { Timestamp } from "firebase/firestore";
import React, { Dispatch } from "react";

import { SimpleQuestionNode } from "./instructorsTypes";
import { ActionTrackType, KnowledgeChoice } from "./knowledgeTypes";
import { NodeType, SnapshotChangesTypes } from "./types";
import { Flashcard } from "./types/IAssitantConversation";

export type OpenPart = "LinkingWords" | "Tags" | "References" | undefined;

export type ChoosingType = "Reference" | "Tag" | "Parent" | "Child" | "Improvement" | "Node" | null;

export type ChoosingNode = {
  id: string;
  type: ChoosingType;
  impact?: string;
};

export type ChosenNode = {
  id: string;
  title: string;
};

export type SelectedUser = {
  username: string;
  imageUrl: string;
  fullName: string;
  chooseUname: boolean;
};

export type SelectionType = "AcceptedProposals" | "Proposals" | "Citations" | "Comments" | "UserInfo" | null;

export type LastOperation = "CancelProposals" | "ProposeProposals";
/**
 * - sNode: node that user is currently selected (node will be highlighted)
 * - isSubmitting: flag set to true when sending request to server
 * - choosingNode: id and type of node that will be modified by improvement proposal when entering state of selecting specific node (for tags, references, child and parent links)
 * - chosenNode: id and title of node that is chosen to be tag, reference, parent or child to choosingNode
 * - selectedNode: node that is in focus (highlighted)
 * - selectionType: will result in pending proposals sidebar or accepted propsals sidebar opening
 * - selectedTags: list of tags used for searching
 * - openToolbar: to open user setting sidebar
 * - selectedUser: to open user info sidebar
 * - searchByTitleOnly: to use only title to search, in other searches it uses content as well
 */
export interface NodeBookState {
  readonly sNode: string | null;
  readonly isSubmitting: boolean;
  readonly choosingNode: ChoosingNode | null;
  readonly previousNode: any;
  readonly chatNode: any;
  readonly chosenNode: ChosenNode | null;
  readonly selectedNode: string | null;
  readonly initialProposal: string | null;
  readonly selectionType: SelectionType;
  readonly selectedTags: string[];
  readonly openToolbar: boolean;
  readonly selectedUser: SelectedUser | null;
  readonly searchByTitleOnly: boolean;
  readonly searchQuery: string;
  readonly nodeTitleBlured: boolean;
  readonly openEditButton: boolean;
  readonly nodeId: any;
  readonly isMenuOpen: boolean;
  readonly lastOperation: LastOperation;
  readonly contributorsNodeId: any;
  readonly showContributors: any;
}

export type TNodeBookState = {
  sNode: string | null;
  isSubmitting: boolean;
  choosingNode: ChoosingNode | null;
  previousNode: any;
  chosenNode: ChosenNode | null;
  selectedNode: string | null;
  initialProposal: string | null;
  selectionType: SelectionType;
  selectedTags: string[];
  openToolbar: boolean;
  selectedUser: SelectedUser | null;
  searchByTitleOnly: boolean;
  searchQuery: string;
  nodeTitleBlured: boolean;
  openEditButton: boolean;
  nodeId: any;
  isMenuOpen: boolean;
  lastOperation: LastOperation;
  contributorsNodeId: any;
  showContributors: any;
  chatNode: any;
};

export type SetSNodeAction = {
  type: "setSNode";
  payload: string | null;
};

export type SetIsSubmittingAction = {
  type: "setIsSubmitting";
  payload: boolean;
};

export type SetChoosingNodeAction = {
  type: "setChoosingNode";
  payload: ChoosingNode | null;
};

export type SetChatNodeAction = {
  type: "setChatNode";
  payload: any;
};

export type SetPreviousNode = {
  type: "setPreviousNode";
  payload: any;
};

export type SetChosenNodeAction = {
  type: "setChosenNode";
  payload: ChosenNode | null;
};

export type SetSelectedNodeAction = {
  type: "setSelectedNode";
  payload: string | null;
};

export type SetSelectionTypeAction = {
  type: "setSelectionType";
  payload: SelectionType;
};

export type SetSelectedTagsAction = {
  type: "setSelectedTags";
  payload: string[];
};

// export type SetOpenToolbar = {
//   type: "setOpenToolbar";
//   payload: boolean;
// };

export type SetSelectedUserAction = {
  type: "setSelectedUser";
  payload: SelectedUser | null;
};

export type SetSearchQueryAction = {
  type: "setSearchQuery";
  payload: string;
};

export type SetNodeTitleBluredAction = {
  type: "setNodeTitleBlured";
  payload: boolean;
};

export type SetSearchByTitleOnly = {
  type: "setSearchByTitleOnly";
  payload: boolean;
};

export type SetOpenEditButtonAction = {
  type: "setOpenEditButton";
  payload: any;
};

export type SetIsMenuOpen = {
  type: "setIsMenuOpen";
  payload: any;
};
export type SetLastOperation = {
  type: "setLastOperation";
  payload: LastOperation;
};

export type SetContributorsNodeId = {
  type: "setContributorsNodeId";
  payload: any;
};
export type SetInitialProposal = {
  type: "setInitialProposal";
  payload: string | null;
};

export type SetAll = {
  type: "setAll";
  payload: TNodeBookState;
};

export type DispatchNodeBookActions =
  | SetSNodeAction
  | SetIsSubmittingAction
  | SetChoosingNodeAction
  | SetPreviousNode
  | SetChatNodeAction
  | SetChosenNodeAction
  | SetSelectedNodeAction
  | SetSelectionTypeAction
  | SetSelectedTagsAction
  // | SetOpenToolbar
  | SetSelectedUserAction
  | SetSearchQueryAction
  | SetNodeTitleBluredAction
  | SetSearchByTitleOnly
  | SetOpenEditButtonAction
  | SetIsMenuOpen
  | SetLastOperation
  | SetContributorsNodeId
  | SetInitialProposal
  | SetAll;

export type NodeBookActions = {
  dispatch: Dispatch<DispatchNodeBookActions>;
  handleError: (options: ErrorOptions) => void;
};

export type TutorialState = null | NodeTutorialState;

export type StepTutorialConfig = {
  localSnapshot: FullNodeData[];
  targetId: string;
  childTargetId?: string;
  title: string;
  description: React.ReactNode;
  disabledElements?: string[];
  enableChildElements?: string[];
  isClickable?: boolean;
  forceScrollToNode?: boolean;
  targetDefaultProperties?: Partial<FullNodeData>;
  tooltipPosition?: "top" | "bottom" | "left" | "right" | "topLeft";
  anchor?: string;
  largeTarget?: boolean;
};
export interface NodeTutorialState {
  localSnapshot: FullNodeData[];
  targetId: string;
  childTargetId?: string;
  title: string;
  description: React.ReactNode;
  disabledElements: string[];
  enableChildElements: string[];
  anchor: string;
  currentStepName: number;
  nextStepName: number;
  previousStepName: number;
  tooltipPosition: "top" | "bottom" | "left" | "right" | "topLeft";
  isClickable: boolean;
  targetDelay?: number;
  forceScrollToNode?: boolean;
  targetDefaultProperties?: Partial<FullNodeData>;
  largeTarget?: boolean;
}

export type TOOLTIP_SIZE = "md" | "lg";

export type TutorialStepConfig = {
  // targetId?: string;
  childTargetId?: string;
  title: string;
  description:
    | React.ReactNode
    | ((node: FullNodeData, nodeParent?: FullNodeData, nodeChild?: FullNodeData) => React.ReactNode);
  anchor?: string;
  tooltipSize?: TOOLTIP_SIZE;
  tooltipPosition?: "top" | "bottom" | "left" | "right" | "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  targetDelay?: number;
  outline?: "shallow" | "outside" | "inside";
  isClickable?: boolean;
  leftOffset?: number;
  topOffset?: number;
};

export type TutorialStep = {
  // targetId: string;
  childTargetId?: string;
  title: string;
  description:
    | React.ReactNode
    | ((node: FullNodeData, nodeParent?: FullNodeData, nodeChild?: FullNodeData) => React.ReactNode);
  anchor: string;
  currentStepName: number;
  nextStepName: number;
  previousStepName: number;
  tooltipSize: TOOLTIP_SIZE;
  tooltipPosition: "top" | "bottom" | "left" | "right" | "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  targetDelay?: number;
  outline?: "shallow" | "outside" | "inside";
  isClickable?: boolean;
  leftOffset: number;
  topOffset: number;
};

export type StepReducerPayload = {
  callback?: () => void;
};

export type UserNodeFirestore = {
  // "firstVisit": Timestamp,//CHECK
  // "lastVisit": Timestamp,//CHECK
  // "userNodeId": string,//CHECK
  updatedAt: Timestamp;
  open?: boolean;
  deleted: boolean;
  wrong: boolean;
  bookmarked: boolean;
  isStudied: boolean;
  visible?: boolean;
  createdAt: Timestamp;
  correct: boolean;
  user: string;
  changed: boolean;
  node: string;
  notebooks: string[];
  expands: boolean[];
  nodeChanges?: any;
  isMock?: boolean;
};

export type UserNodeSnapshot = {
  cType: string;
  uNodeId: string;
  uNodeData: UserNodeFirestore;
};

export type UserNode = UserNodeFirestore & {
  id: string;
};

export type NodeBookNodes = {
  [key: string]: {
    chooseUname?: boolean;
    fullname?: string;
    imageUrl?: string;
    reputation?: number;
  };
};

export type NodeFireStore = {
  aChooseUname: boolean;
  aFullname: string;
  aImgUrl?: string;
  admin: string;
  bookmarks?: number;
  changedAt: Timestamp;
  children: {
    node: string;
    label: string;
    title: string;
    type: string;
    visible?: boolean;
  }[];
  choices: KnowledgeChoice[];
  closedHeight?: number;
  comments: number;
  content: string;
  contribNames: string[];
  contributors: {
    [key: string]: {
      chooseUname: boolean;
      fullname: string;
      imageUrl: string;
      reputation: number;
    };
  };
  corrects: number;
  createdAt: Timestamp;
  deleted: boolean;
  height?: number; // TODO: height should not exist on DB, remove please
  institNames: string[];
  institutions: {
    [key: string]: { reputation?: number };
  };
  isTag: boolean;
  maxVersionRating?: number;
  nodeImage?: string;
  nodeVideo?: string;
  nodeVideoEndTime?: number;
  nodeVideoStartTime?: number;
  nodeType: NodeType;
  nodeTypes?: NodeType[];
  parents: {
    node: string;
    label: string;
    title: string;
    type: string;
    visible?: boolean;
  }[];
  referenceIds: string[];
  referenceLabels: string[];
  references: string[];
  studied: number;
  tagIds: string[];
  tags: string[];
  title: string;
  updatedAt: Timestamp;
  versions?: number;
  viewers: number;
  wrongs: number;
  locked?: boolean;
};

export type UserNodeChanges = { cType: SnapshotChangesTypes; uNodeId: string; uNodeData: UserNodeFirestore };

export type NodesData = { cType: SnapshotChangesTypes; nId: string; nData: NodeFireStore } | null;

export type FullNodeData = Omit<UserNodeFirestore, "changedAt" | "createdAt" | "updatedAt"> &
  Omit<NodeFireStore, "changedAt" | "createdAt" | "updatedAt" | "bookmarks"> & {
    editable: boolean;
    left: number;
    openHeight?: number;
    isNew?: boolean;
    top: number;
    userNodeId: string;
    nodeChangeType: SnapshotChangesTypes; // TODO: check if we can remove it
    userNodeChangeType: SnapshotChangesTypes;
    firstVisit: Date;
    lastVisit: Date;
    changedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    width?: number;
    height?: number;
    simulated?: boolean;
    disableVotes?: boolean;
    unaccepted?: boolean;
    flashcard?: Flashcard;
    // left: number;
    // top: number;
    x?: number;
    y?: number;
    localLinkingWords?: OpenPart;
    addedTags?: string[];
    removedTags?: string[];
    addedReferences?: string[];
    removedReferences?: string[];
    addedParents?: any[];
    removedParents?: any[];
    addedChildren?: any[];
    removedChildren?: any[];
    bookmarks: number;
  };

export type EdgeData = {
  fromX: number;
  fromY: number;
  label: string;
  points: any[];
  toX: number;
  toY: number;
};

export type FullNodesData = { [key: string]: FullNodeData };
export type EdgesData = { [key: string]: EdgeData };
export type TNodeUpdates = {
  nodeIds: string[];
  updatedAt: Date;
};

export type Node = NodeFireStore & { id: string };

export type SortDirection = "ASCENDING" | "DESCENDING";
export type SortValues =
  | "LAST_VIEWED"
  | "DATE_MODIFIED"
  | "PROPOSALS"
  | "UP_VOTES"
  | "DOWN_VOTES"
  | "NET_NOTES"
  | "NOT_SELECTED";
export type UsersStatus = "All Time" | "Monthly" | "Weekly" | "Others Votes" | "Others Monthly";

// export type Cluster = {
//   id: string;
//   y: number;
//   x: number;
//   width: number;
//   height: number;
//   title: string;
// };

// export type ClusterNodes = { [key: string]: Cluster };

export type TutorialTypeKeys =
  | "nodes"
  | "searcher"
  | "userSettings"
  | "proposal"
  | "navigation"
  | "concept"
  | "relation"
  | "reference"
  | "idea"
  | "question"
  | "code"
  | "proposalConcept"
  | "proposalRelation"
  | "proposalReference"
  | "proposalIdea"
  | "proposalQuestion"
  | "proposalCode"
  | "reconcilingAcceptedProposal"
  | "reconcilingNotAcceptedProposal"
  | "childProposal"
  | "childConcept"
  | "childRelation"
  | "childReference"
  | "childQuestion"
  | "childIdea"
  | "childCode"
  | "tmpEditNode"
  | "tmpProposalConceptChild"
  | "tmpProposalRelationChild"
  | "tmpProposalQuestionChild"
  | "tmpProposalReferenceChild"
  | "tmpProposalCodeChild"
  | "tmpProposalIdeaChild"
  | "tmpTagsReferences"
  | "tmpParentsChildrenList"
  | "tmpPathways"
  | "toolbox"
  | "collapseNode"
  | "expandNode"
  | "upVote"
  | "downVote"
  | "hideDescendants"
  | "hideNode"
  | "notifications"
  | "bookmarks"
  | "userInfo"
  | "leaderBoard"
  // | "notebooks"
  | "pendingProposals"
  | "interactionLivenessBar"
  | "reputationLivenessBar"
  | "communityLeaderBoard"
  | "tagsReferences"
  | "parentsChildrenList"
  | "pathways"
  | "knowledgeGraph"
  | "nodeInteractions";

export type UserTutorial = {
  currentStep: number;
  done: boolean;
  skipped: boolean;
  // forceTutorial?: boolean;
};

export type UserTutorials = {
  [key in TutorialTypeKeys]: UserTutorial;
};

export type VoiceAssistantType = "ANSWERING" | "CONFIRM" | "NEXT_ACTION" | "NOTEBOOK_ACTIONS" | null;

export type VoiceAssistant = {
  tagId: string;
  questionNode: SimpleQuestionNode | null;
};

export type ActionTracksDocument = {
  accepted: true;
  action: string;
  chooseUname: boolean;
  createdAt: string;
  doer: string;
  fullname: string;
  imageUrl: string;
  nodeId: string;
  receivers: string[];
  type: ActionTrackType;
};

export type RecentUserNodesDocument = {
  user: string;
  nodeId: string;
  expired: Timestamp;
};
