// see: src/components/map/Sidebar/NotificationsList.tsx
export type INotificationAType =
  | "Correct"
  | "CorrectRM"
  | "Wrong"
  | "WrongRM"
  | "Award"
  | "AwardRM"
  | "Accepted"
  | "Delete"
  | "newChild";
export type INotificationOType = "Node" | "Propo" | "Proposal" | "PropoAccept" | "AccProposal";

export type INotification = {
  documentId?: string;
  chooseUname: boolean;
  proposer: string;
  checked: boolean;
  title?: string; // only 25 of 10865 has it (prod)
  fullname: string;
  nodeId: string;
  uname: string;
  imageUrl: string;
  aType: INotificationAType;
  oType: INotificationOType;
  createdAt: Date;
  updatedAt?: Date;
};

export type INotificationNum = {
  documentId?: string;
  nNum: number;
};
