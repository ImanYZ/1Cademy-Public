import { Timestamp } from "firebase-admin/firestore";

type Node = {
  id: string;
  title: string;
  content: string;
  type: string;
  image?: string;
  video?: string;
};
export type Reaction = {
  user: string;
  emoji: string;
};

type QuotedMessage = {
  id: string;
  value: string;
};

type MemberInfo = {
  uname: string;
  imageUrl: string;
  chooseUname: boolean;
  fullname?: string;
  role?: string;
};

export type MembersInfo = {
  [uname: string]: MemberInfo;
};

// type UserInfo = {
//   uname: string;
//   imageUrl: string;
//   chooseUname: boolean;
//   fullname?: string;
//   role?: string;
// };

// type UsersInfo = {
//   [uname: string]: UserInfo;
// };

export type IChannelMessage = {
  doc?: any;
  heading?: string;
  id?: string;
  parentMessage: string; //this is is for the parent message
  channelId: string;
  quotedMessage?: QuotedMessage;
  message: string;
  forwarded?: boolean;
  forwardedFrom?: string;
  node?: Node;
  imageUrls?: string[];
  videoUrls?: string[];
  sender: string;
  read_by?: string[];
  reactions: Reaction[];
  mentions?: string[];
  replies: IChannelMessage[];
  pinned?: boolean;
  edited?: boolean;
  editedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  deleted: boolean;
  important: boolean;
  notVisible?: boolean;
  totalReplies?: number;
};

export type IAnnouncement = {
  documentId?: string;
  channelId: string;
  channelMessage: IChannelMessage;
  channelMessageId: string;
  pinnedBy: string;
  pinnedAt: Timestamp;
};

export type IChannels = {
  id?: string;
  title: string;
  tagId: string;
  members: string[];
  membersInfo: MembersInfo;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  newsUpdatedAt: Timestamp;
  tag: string;
  channelType: "directMessage" | "group";
  deletedBy: string[];
};

export type IChatNotification = {
  documentId?: string;
  uname: string;
  type: "news" | "channel" | "conversation";
  originId: string;
  lastMessage: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type IConversation = {
  id: string;
  title: string;
  members: string[];
  membersInfo: MembersInfo;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedBy: string[];
};

export type IConversationMessage = {
  documentId?: string;
  conversationId: string;
  quotedMessage?: QuotedMessage;
  message: string;
  forwarded?: boolean;
  forwardedFrom?: string;
  node?: Node;
  imageUrl?: string;
  videoUrl?: string;
  sender: string;
  read_by?: string[];
  reactions: Reaction[];
  mentions?: string[];
  replies?: IConversationMessage[];
  pinned?: boolean;
  edited?: boolean;
  editedAt?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};
