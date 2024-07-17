import { Timestamp } from "firebase/firestore";
import { DocumentReference } from "firebase-admin/firestore";

import { KnowledgeChoice } from "./knowledgeTypes";

export type SnapshotChangesTypes = "added" | "modified" | "removed";

export type NodeType =
  | "Relation"
  | "Concept"
  | "Code"
  | "Reference"
  | "Idea"
  | "Question"
  | "News"
  | "Profile"
  | "Sequel"
  | "Advertisement"
  | "Private";

export type SimpleNode2 = {
  id: string;
  title: string;
  changedAt: string;
  content: string;
  choices: KnowledgeChoice[];
  nodeType: NodeType;
  nodeImage?: string;
  nodeVideo?: string;
  corrects: number;
  wrongs: number;
  tags: string[];
  contributors: { fullName: string; imageUrl: string; username: string }[];
  institutions: { name: string }[];
  versions: number;
  studied?: boolean;
  isTag?: boolean;
};

export type NotebookDocument = {
  owner: string;
  ownerImgUrl: string;
  ownerFullName: string;
  ownerChooseUname: boolean;
  title: string;
  duplicatedFrom: string;
  isPublic: "visible" | "editable" | "none";
  users: string[];
  usersInfo: {
    [uname: string]: {
      role: "viewer" | "editor";
      imageUrl: string;
      fullname: string;
      chooseUname: boolean;
    };
  };
  defaultTagId: string;
  defaultTagName: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  type: "course" | "chat" | "default";
  conversation?: string;
};

export type INotebook = NotebookDocument & {
  id: string;
};

export type ClientErrorType =
  | "TEST_ON_DEVELOP" // 'TEST-ON-DEVELOP' should be ignored, it is used only in develop
  | "OPEN_NODE"
  | "UPDATE_DEFAULT_TAG"
  | "HIDE_DESCENDANTS"
  | "OPEN_ALL_CHILDREN"
  | "OPEN_ALL_PARENTS"
  | "RATE_PROPOSAL"
  | "WRONG_NODES"
  | "IMAGE_UPLOAD"
  | "SAVE_PROPOSED_IMPROVEMENT"
  | "SAVE_PROPOSED_CHILD_NODE"
  | "SAVE_PROPOSED_PARENT_NODE";

/**
 * Frontend and backend types
 * ex: Params and Responses of endpoints
 */

export type TryRubricResponse = {
  rubric_item: string;
  mentioned: "YES" | "NO";
  correct: "YES" | "NO";
  sentences: string[];
};

export type LivelinessBarType = "relativeInteractions" | "relativeReputations" | "interaction" | "reputation";

export type TransactionWrite = { objRef: DocumentReference; data: any; operationType: "update" | "set" | "delete" };
