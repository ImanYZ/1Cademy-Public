import { Timestamp } from "firebase-admin/firestore";

export type KnowledgeChoice = {
  choice: string;
  correct: boolean;
  feedback: string;
};

export type NodeFireStore = {
  aChooseUname?: boolean;
  aFullname?: string;
  aImgUrl?: string;
  admin?: string;
  bookmarks?: number;
  changedAt: Timestamp;
  children?: { node?: string; label?: string; title?: string }[];
  choices?: KnowledgeChoice[];
  closedHeight?: number;
  comments?: number;
  content?: string;
  contribNames?: string[];
  contributors?: {
    [key: string]: {
      chooseUname?: boolean;
      fullname?: string;
      imageUrl?: string;
      reputation?: number;
    };
  };
  corrects?: number;
  createdAt?: Timestamp;
  deleted?: boolean;
  height?: number;
  institNames?: string[];
  institutions?: {
    [key: string]: { reputation?: number };
  };
  isTag?: boolean;
  maxVersionRating?: number;
  nodeImage?: string;
  nodeType: NodeType;
  parents?: { node?: string; label?: string; title?: string }[];
  referenceIds?: string[];
  referenceLabels?: string[];
  references?: string[] | { node: string; title?: string; label?: string }[];
  studied?: number;
  tagIds?: string[];
  tags?: string[] | { node: string; title?: string; label?: string }[];
  title?: string;
  updatedAt: Timestamp;
  versions?: number;
  viewers?: number;
  wrongs?: number;
};

export type TypesenseNodesSchema = {
  changedAt: string;
  changedAtMillis: number; // typesense
  choices?: KnowledgeChoice[];
  contributors: { fullName: string; imageUrl: string; username: string }[];
  contributorsNames: string[]; // typesense
  contribNames: string[];
  institNames: string[];
  content: string; // typesense
  corrects: number; // typesense
  id: string;
  institutions: { name: string }[];
  institutionsNames: string[]; // typesense
  labelsReferences: string[]; // typesense
  nodeImage?: string;
  nodeType: NodeType; // typesense
  tags: string[]; // typesense
  title: string; // typesense
  titlesReferences: string[]; // typesense
  updatedAt: number;
  wrongs: number; //typesense
  mostHelpful: number; // typesense
  isTag: boolean; // typesense
  versions: number; // typesense
  netVotes: number; // typesense
};

export type TypesenseProcessedReferences = {
  id: string;
  title: string;
  data: { label: string; node: string }[];
};

export enum NodeType {
  "Relation" = "Relation",
  "Concept" = "Concept",
  "Code" = "Code",
  "Reference" = "Reference",
  "Idea" = "Idea",
  "Question" = "Question",
  "Profile" = "Profile",
  "Sequel" = "Sequel",
  "Advertisement" = "Advertisement",
  "News" = "News",
  "Private" = "Private",
  "Tag" = "Tag",
}

export type LinkedKnowledgeNode = {
  label?: string;
  node: string;
  title?: string;
  content?: string;
  nodeImage?: string;
  nodeType: NodeType;
};
