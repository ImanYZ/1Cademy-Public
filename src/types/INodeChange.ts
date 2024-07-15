import { Timestamp } from "firebase-admin/firestore";

import { INode } from "./INode";

export interface INodeChange {
  nodeId: string;
  nodeChanges?: Partial<INode>;
  createdAt: Timestamp;
}
