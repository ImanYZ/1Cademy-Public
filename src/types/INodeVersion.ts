import { Timestamp } from "firebase-admin/firestore";

import { INodeLink } from "./INodeLink";
import { INodeType } from "./INodeType";
import { IQuestionChoice } from "./IQuestionChoice";

export type INodeVersion = {
  id?: string;
  documentId?: string;
  childType?: INodeType;
  choices?: IQuestionChoice[];
  content: string;
  title: string;
  fullname: string;
  children: INodeLink[];
  addedInstitContris?: boolean; // TODO: investigate this, if it run worker even its assigned to true already
  accepted: boolean;
  imageUrl: string;
  updatedAt: Date | Timestamp;
  chooseUname: boolean;
  node: string;
  parents: INodeLink[];
  deleted: boolean;
  corrects: number;
  proposer: string;
  viewers: number;
  proposal: string; // reason of purposed changes
  addedParents?: boolean;
  removedParents?: boolean;
  addedChoices?: boolean;
  deletedChoices?: boolean;
  changedChoices?: boolean;
  changedTitle?: boolean;
  changedContent?: boolean;
  addedImage?: boolean;
  deletedImage?: boolean;
  changedImage?: boolean;
  addedVideo?: boolean;
  deletedVideo?: boolean;
  changedVideo?: boolean;
  addedAudio?: boolean;
  deletedAudio?: boolean;
  changedAudio?: boolean;
  addedReferences?: boolean;
  deletedReferences?: boolean;
  changedReferences?: boolean;
  addedTags?: boolean;
  deletedTags?: boolean;
  changedTags?: boolean;
  addedChildren?: boolean;
  removedChildren?: boolean;
  changedNodeType?: boolean;
  awards: number;
  summary: string;
  nodeImage?: string;
  nodeVideo?: string;
  nodeVideoStartTime?: string;
  nodeVideoEndTime?: string;
  nodeAudio?: string;
  subType?: string;
  referenceIds: string[];
  references: string[];
  referenceLabels: string[];
  wrongs: number;
  createdAt: Date | Timestamp;
  tags: string[];
  tagIds: string[];
  newNodeId?: string;
  correct?: boolean;
  wrong?: boolean;
  award?: boolean;
  nodeType: string;
};

// import { Timestamp } from "firebase-admin/firestore";

// import type { INodeContributor } from "./INodeContributor";
// import { INodeLink } from "./INodeLink";
// import { INodeType } from "./INodeType";
// import { IQuestionChoice } from "./IQuestionChoice";

// export type INodeVoteActionType = "Correct" | "Wrong";

// export type IVersion = {
//   documentId?: string;
//   aChooseUname: boolean;
//   aImgUrl: string;
//   aFullname: string;
//   admin: string;
//   corrects: number;
//   wrongs: number;
//   nodeType: INodeType;
//   nodeTypes?: INodeType[];
//   contribNames: string[];
//   contributors: {
//     [key: string]: INodeContributor;
//   };
//   title: string;
//   nodeImage?: string;
//   nodeSlug?: string;
//   nodeVideo?: string;
//   nodeAudio?: string;
//   comments: number;
//   deleted: boolean;
//   content: string;
//   viewers: number;
//   versions: number;
//   isTag?: boolean;
//   tags: string[];
//   tagIds: string[];
//   height: number; // TODO: remove during migration
//   closedHeight?: number; // TODO: remove during migration
//   bookmarks?: number;
//   choices?: IQuestionChoice[]; // it only exists for nodeType=Question
//   studied: number;
//   references: string[];
//   referenceLabels: string[];
//   referenceIds: string[];
//   parents: INodeLink[];
//   institNames: string[];
//   institutions: {
//     [key: string]: {
//       reputation: number;
//     };
//   };
//   locked?: boolean;
//   changedAt: Date | Timestamp;
//   createdAt: Date | Timestamp;
//   updatedAt: Date | Timestamp;
//   children: INodeLink[];
//   maxVersionRating: number;
// };
