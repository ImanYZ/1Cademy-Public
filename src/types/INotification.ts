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
  chooseUname: boolean;
  proposer: string;
  checked: boolean;
  title: string;
  fullname: string;
  aType: INotificationAType;
  nodeId: string;
  createdAt: Date;
  uname: string;
  imageUrl: string;
  oType: INotificationOType;
  updatedAt: Date;
};

export type INotificationNum = {
  nNum: number;
};
