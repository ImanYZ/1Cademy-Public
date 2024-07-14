import { Timestamp } from "firebase-admin/firestore";

import { INode } from "./INode";

export interface IQueue {
  name: string;
  type: "parallel" | "series";
  maxRetry?: number;
  jobId?: string;
  jobStartedAt?: Timestamp;
}

export interface BaseJob {
  type: string;
  queue: string;
  payload: Record<string, any>;
  status: "pending" | "executing" | "failed" | "completed";
  retry?: number;
  createdAt: Timestamp;
}

export interface SignalAllNodesJob extends BaseJob {
  type: "signal_all_node_changes";
  // signalAllNodeChanges
  payload: {
    nodeId: string;
    nodeChanges: Partial<INode>;
    major: boolean;
  };
}

export interface UpdatedNodeLinksJob extends BaseJob {
  type: "updated_node_links";
  payload: {
    nodeId: string;
    title: string;
    nodeType: string;
    addedParents: string[];
    addedChildren: string[];
    removedParents: string[];
    removedChildren: string[];
  };
}

export interface LogActionTrackJob extends BaseJob {
  type: "log_action_track";
  payload: {
    nodeId: string;
    title: string;
    nodeType: string;
    addedParents: string[];
    addedChildren: string[];
    removedParents: string[];
    removedChildren: string[];
  };
}

export type Job = SignalAllNodesJob | UpdatedNodeLinksJob | BaseJob;
