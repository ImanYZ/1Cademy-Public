import { Timestamp } from "firebase-admin/firestore";

import { INodeLink } from "./INodeLink";

export type INodeChanges = {
  aImgUrl?: string;
  aFullname?: string;
  aChooseUname?: string;
  admin?: string;
  corrects?: number;
  wrongs?: number;
  studied?: number;
  children?: INodeLink[];
  maxVersionRating?: number;
  changedAt?: Date;
  updatedAt?: Date;
};

export type IUserNode = {
  documentId?: string;
  changed: boolean;
  open: boolean;
  deleted: boolean;
  node: string;
  user: string;
  visible?: boolean;
  notebooks?: string[];
  expands?: boolean[];
  correct: boolean;
  wrong: boolean;
  isStudied: boolean;
  bookmarked?: boolean;
  nodeChanges: INodeChanges;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
};
