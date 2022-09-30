import { INodeLink } from "./INodeLink";
import { INodeType } from "./INodeType";

export type INodeVersion = {
  documentId?: string;
  childType?: INodeType;
  content: string;
  title: string;
  fullname: string;
  children: INodeLink[];
  addedInstitContris: boolean; // TODO: investigate this, if it run worker even its assigned to true already
  accepted: boolean;
  imageUrl: string;
  updatedAt: Date;
  chooseUname: boolean;
  node: string;
  parents: INodeLink[];
  addedParents: boolean;
  deleted: boolean;
  corrects: number;
  proposer: string;
  viewers: number;
  proposal: string; // reason of purposed changes
  removedParents: boolean;
  awards: number;
  summary: string;
  nodeImage: string;
  referenceIds: string[];
  references: string[];
  referenceLabels: string[];
  wrongs: number;
  createdAt: Date;
  tags: string[];
  tagIds: string[];
};
