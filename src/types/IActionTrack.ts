import { Timestamp } from "firebase-admin/firestore";

export type IActionTrackType = "NodeVote" | "Improvement" | "ChildNode" | "RateVersion";
export type IActionTrackAction = "Correct" | "Wrong" | "CorrectRM" | "WrongRM" | string;

export type IActionTrack = {
  documentId?: string;
  type: IActionTrackType;
  nodeId: string;
  action: IActionTrackAction;
  accepted: boolean;
  createdAt: Timestamp;
  doer: string; // proposer or voter
  imageUrl: string;
  receivers: string[]; // single for rateVersion and multiple for node vote
};

/*
type: string; NodeVote, Improvement, ChildNode, RateVersion
nodeId: string;
proposalId?: string;
proposer?: string;
affectee?: string | string[];
accepted: boolean;
createdAt: Timestamp;
voter?: string;
vote?: string; Correct, Wrong, CorrectRM, WrongRM
*/
