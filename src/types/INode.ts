import type { INodeContributor } from "./INodeContributor";
import { INodeLink } from "./INodeLink";
import { INodeType } from "./INodeType";
import { IQuestionChoice } from "./IQuestionChoice";

export type INodeVoteActionType = "Correct" | "Wrong";

export type INode = {
  documentId?: string;
  aChooseUname: boolean;
  aImgUrl: string;
  aFullname: string;
  admin: string;
  corrects: number;
  wrongs: number;
  nodeType: INodeType;
  contribNames: string[];
  contributors: {
    [key: string]: INodeContributor;
  };
  title: string;
  nodeImage?: string;
  nodeVideo?: string;
  nodeAudio?: string;
  comments: number;
  deleted: boolean;
  content: string;
  viewers: number;
  versions: number;
  isTag?: boolean;
  tags: string[];
  tagIds: string[];
  height: number; // TODO: remove during migration
  closedHeight?: number; // TODO: remove during migration
  bookmarks?: number;
  choices?: IQuestionChoice[]; // it only exists for nodeType=Question
  studied: number;
  references: string[];
  referenceLabels: string[];
  referenceIds: string[];
  parents: INodeLink[];
  institNames: string[];
  institutions: {
    [key: string]: {
      reputation: number;
    };
  };
  locked?: boolean;
  changedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  children: INodeLink[];
  maxVersionRating: number;
};
