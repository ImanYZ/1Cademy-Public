import { Timestamp } from "firebase-admin/firestore";

export type IPracticeFlash = {
  documentId?: string;
  practiceIds: string;
  uname: string;
  tagId: string;
  expired: Timestamp | Date;
};
