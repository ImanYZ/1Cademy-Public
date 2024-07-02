import { Timestamp } from "firebase-admin/firestore";

export type Reaction = {
  user: string;
  emoji: string;
};

export type senderDetail = {
  [uname: string]: {
    uname: string;
    imageUrl: string;
    chooseUname: boolean;
    fullname?: string;
    role?: string;
  };
};

export type IComment = {
  doc?: any;
  heading?: string;
  id?: string;
  parentComment: string;
  comment: string;
  imageUrls?: string[];
  videoUrls?: string[];
  sender: string;
  senderDetail: senderDetail;
  read_by?: string[];
  reactions: Reaction[];
  mentions?: string[];
  pinned?: boolean;
  edited?: boolean;
  editedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  deleted: boolean;
  totalReplies?: number;
};
