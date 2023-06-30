import { Timestamp } from "firebase/firestore";

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
  corrects: number;
  wrongs: number;
  tags: string[];
  contributors: { fullName: string; imageUrl: string; username: string }[];
  institutions: { name: string }[];
  versions: number;
  studied?: boolean;
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
};

export type Notebook = NotebookDocument & {
  id: string;
};
