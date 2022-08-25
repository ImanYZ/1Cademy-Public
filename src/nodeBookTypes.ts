import { Timestamp } from "firebase/firestore";
import { Dispatch } from "react";

// import { NodeType } from "./types";

export type OpenPart = 'LinkingWords' | 'Tags' | 'References' | null

export type ChoosingType = 'Reference' | 'Tag' | 'Parent' | 'Child' | null

export type ChoosingNode = {
  id: string,
  type: ChoosingType
}

export type ChosenNode = {
  id: string,
  title: string
}

export type SelectionType = 'AcceptedProposals' | 'Proposals' | 'Citations' | 'Comments' | null


/**
 * - sNode: node that user is currently selected (node will be highlighted)
 * - isSubmitting: flag set to true when sending request to server
 * - choosingNode: id and type of node that will be modified by improvement proposal when entering state of selecting specific node (for tags, references, child and parent links)
 * - chosenNode: id and title of node that is chosen to be tag, reference, parent or child to choosingNode
 * - selectedNode: node that is in focus (highlighted)
 * - selectionType: will result in pending proposals sidebar or accepted propsals sidebar opening
 * - selectedTags: list of tags used for searching
 * - choosingType: type of the selected option on choosing Node
 */
export interface NodeBookState {
  readonly sNode: string | null;
  readonly isSubmitting: boolean;
  readonly choosingNode: ChoosingNode | null;
  readonly chosenNode: ChosenNode | null;
  readonly selectedNode: string | null;
  readonly selectionType: SelectionType;
  readonly selectedTags: string[];
  // readonly choosingType: ChoosingType;
}

export type SetSNodeAction = {
  type: "setSNode",
  payload: string | null
}

export type SetIsSubmittingAction = {
  type: "setIsSubmitting",
  payload: boolean
}

export type SetChoosingNodeAction = {
  type: "setChoosingNode",
  payload: ChoosingNode | null
}

export type SetChosenNodeAction = {
  type: "setChosenNode",
  payload: ChosenNode | null
}

export type SetSelectedNodeAction = {
  type: "setSelectedNode",
  payload: string | null
}

export type SetSelectionTypeAction = {
  type: "setSelectionType",
  payload: SelectionType
}

export type SetSelectedTagsAction = {
  type: "setSelectedTags",
  payload: string[]
}

// export type SetChoosingTypeAction = {
//   type: "setChoosingType",
//   payload: ChoosingType
// }

export type DispatchNodeBookActions =
  | SetSNodeAction
  | SetIsSubmittingAction
  | SetChoosingNodeAction
  | SetChosenNodeAction
  | SetSelectedNodeAction
  | SetSelectionTypeAction
  | SetSelectedTagsAction
// | SetChoosingTypeAction

export type NodeBookActions = {
  dispatch: Dispatch<DispatchNodeBookActions>
  handleError: (options: ErrorOptions) => void;
}

export type UserNodesData = {
  // "firstVisit": Timestamp,//CHECK
  // "lastVisit": Timestamp,//CHECK
  // "userNodeId": string,//CHECK
  "updatedAt": Timestamp,
  "open": boolean,
  "deleted": boolean,
  "wrong": boolean,
  "bookmarked": boolean,
  "isStudied": boolean,
  "visible": boolean,
  "createdAt": Timestamp,
  "correct": boolean,
  "user": string,
  "changed": boolean,
  "node": string,
  "nodeChanges"?: any
}

export type UserNodes = {
  cType: string,
  uNodeId: string,
  uNodeData: UserNodesData
}

export type NodeBookNodes = {
  [key: string]: {
    chooseUname?: boolean;
    fullname?: string;
    imageUrl?: string;
    reputation?: number;
  };
}