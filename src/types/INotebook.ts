import { Timestamp } from "firebase-admin/firestore";

export type INotebook = {
  documentId?: string;
  owner: string;
  ownerImgUrl: string;
  ownerFullName: string;
  ownerChooseUname: boolean;
  duplicatedFrom?: string;
  title: string;
  isPublic: "visible" | "editable" | "none";
  users: string[];
  usersInfo: {
    [uname: string]: {
      role: "viewer" | "editor";
      imageUrl: string;
      fullname: string;
      chooseUname: boolean;
    };
  };
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
};
