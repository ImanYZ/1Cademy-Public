import { Timestamp } from "firebase-admin/firestore";

export interface IQueue {
  name: string;
  type: "parallel" | "series";
  maxRetry?: number;
  jobId?: string;
  jobStartedAt?: Timestamp;
}

export interface IJob {
  type: string;
  queue: string;
  payload: Record<string, any>;
  status: "pending" | "executing" | "failed" | "completed";
  retry?: number;
  createdAt: Timestamp;
}
