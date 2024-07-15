import { Timestamp } from "firebase-admin/firestore";

export interface IRequestLog {
  uname: string;
  uri: string;
  method: string;
  body?: any;
  createdAt: Timestamp;
}
