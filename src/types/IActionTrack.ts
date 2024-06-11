import { Timestamp } from "firebase-admin/firestore";

export type IActionTrackType =
  | "NodeVote"
  | "Improvement"
  | "ChildNode"
  | "ParentNode"
  | "RateVersion"
  | "NodeOpen"
  | "NodeHide"
  | "NodeCollapse"
  | "NodeStudied"
  | "NodeBookmark"
  | "NodeShare"
  | "NodeTitleChanged"
  | "NodeContentChanged"
  | "Search"
  | "MessageSent"
  | "MessageReplied"
  | "MessageEdited"
  | "MessageTyped"
  | "MessageReacted"
  | "MessageTabChanged"
  | "MessageRoomOpened"
  | "MessageMarkUnread"
  | "MessageMemberAdded";
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
  receiversData?: any;
  receiverPoints?: number[];
  email: string;
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
