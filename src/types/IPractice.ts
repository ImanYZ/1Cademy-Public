import { Timestamp } from "firebase-admin/firestore";

export type IPractice = {
  documentId?: string;
  lastPresented: Date | null;
  createdAt: Date;
  node: string;
  user: string;
  eFactor: number;
  tagId: string;
  nextDate: Date | Timestamp;
  lastCompleted: Date | null;
  q: number;
  updatedAt: Date;
  iInterval: number;
  lastId?: string; // This will hold last id that was presented as question
  questionNodes: string[];
};
