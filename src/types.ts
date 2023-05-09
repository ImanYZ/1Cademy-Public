import { Timestamp } from "firebase/firestore";

import { KnowledgeChoice } from "./knowledgeTypes";

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
  title?: string;
  changedAt?: string;
  content?: string;
  choices: KnowledgeChoice[];
  nodeType: NodeType;
  nodeImage?: string;
  corrects?: number;
  wrongs?: number;
  tags: string[];
  contributors: { fullName: string; imageUrl: string; username: string }[];
  institutions: { name: string }[];
  versions: number;
  studied?: boolean;
};

export type NotebookUserRole = "viewer" | "editor" | "owner";

export type NotebookDocument = {
  owner: string;
  ownerImgUrl: string;
  ownerFullName: string;
  ownerChooseUname: boolean;
  title: string;
  duplicatedFrom: string;
  isPublic: "visible" | "editable" | "private";
  users: string[]; // here is users which access and owner
  usersInfo: {
    [uname: string]: {
      role: NotebookUserRole;
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

export type RequestDocument = {
  requestingUser: string;
  requestingUserInfo: {
    imageUrl: string;
  };
  requestedUser: string;
  requestedUserInfo: {
    imageUrl: string;
  };
  permission: "view" | "edit";
  item: string;
  itemInfo: {
    name: string;
  };
  state: "waiting" | "denied" | "accepted";
  type: "notebook";
};
