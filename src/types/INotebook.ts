import { Timestamp } from "firebase-admin/firestore";

export type INotebook = {
  documentId?: string;
  conversation?: string; // If this property has id of conversation then we don't include this notebook in notebook list but, we list them in conversation
  defaultTagId?: string;
  defaultTagName?: string;
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
      role: "viewer" | "editor" | "owner";
      imageUrl: string;
      fullname: string;
      chooseUname: boolean;
    };
  };
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
};
