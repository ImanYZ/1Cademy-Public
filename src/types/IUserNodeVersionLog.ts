import { INodeType } from "./INodeType";

export type IUserNodeVersionLog = {
  documentId?: string;
  correct: boolean;
  wrong: boolean;
  award: boolean;
  version: string; // version id
  user: string;
  nodeType?: INodeType;
  createdAt: Date;
};
