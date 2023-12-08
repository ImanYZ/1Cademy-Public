import { Timestamp } from "firebase-admin/firestore";

type Node = {
  id: string;
  title: string;
  type: string;
  image?: string;
  video?: string;
};
type Reactions = {
  user: string;
  icon: string;
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

type MembersInfo = {
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
  documentId?: string;
  channelId: string;
  quotedMessage?: QuotedMessage;
  message: string;
  forwarded?: boolean;
  forwardedFrom?: string;
  node?: Node;
  imageUrl?: string;
  videoUrl?: string;
  sender: string;
  read_by?: string[];
  reactions: Reactions[];
  mentions?: string[];
  replies?: IChannelMessage[];
  pinned?: boolean;
  edited?: boolean;
  editedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  deleted: boolean;
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
  tag: string;
  channelType: "directMessage" | "group";
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
  id?: string;
  title: string;
  members: string[];
  membersInfo: MembersInfo;
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
  reactions: Reactions[];
  mentions?: string[];
  replies?: IConversationMessage[];
  pinned?: boolean;
  edited?: boolean;
  editedAt?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};