import { INodeType } from "./INodeType";

export type IUserNodeVersion = {
  documentId?: string;
  wrong: boolean;
  award: boolean;
  correct: boolean;
  version: string; // version id
  user: string;
  opened?: boolean;
  nodeType?: INodeType;
  createdAt: Date;
  updatedAt?: Date;
};
