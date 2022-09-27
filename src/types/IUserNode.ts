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
  visible: string;
  correct: boolean;
  wrong: boolean;
  isStudied: boolean;
  bookmarked?: boolean;
  nodeChanges: INodeChanges;
  createdAt: Date;
  updatedAt: Date;
};
