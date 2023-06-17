import { Timestamp } from "firebase-admin/firestore";

export type IActionTrackType =
  | "NodeVote"
  | "Improvement"
  | "ChildNode"
  | "RateVersion"
  | "NodeOpen"
  | "NodeHide"
  | "NodeCollapse"
  | "NodeStudied"
  | "NodeBookmark"
  | "NodeShare"
  | "Search";
export type IActionTrackAction = "Correct" | "Wrong" | "CorrectRM" | "WrongRM" | string;

export type IActionTrack = {
  documentId?: string;
  type: IActionTrackType;
  nodeId: string;
  action: IActionTrackAction;
  accepted: boolean;
  createdAt: Timestamp;
  doer: string; // proposer or voter
  chooseUname: boolean;
  fullname: string;
  imageUrl: string;
  receivers: string[]; // single for rateVersion and multiple for node vote
  receiverPoints?: number[];
};
