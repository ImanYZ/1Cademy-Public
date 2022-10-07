export type IMessage = {
  documentId?: string;
  uid: string; // firebase auth id
  username: string;
  updatedAt?: Date;
  imageUrl: string;
  timestamp: Date;
  tagId: string;
  tag: string;
  chooseUname?: boolean;
  storageUri?: string;
  uploadedUrl?: string;
  fullname?: string;
  content?: string;
  nodeLink?: string; // nodeId
  nodeTitle?: string;
};
