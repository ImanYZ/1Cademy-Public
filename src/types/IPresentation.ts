export type IPresentation = {
  documentId?: string;
  tagId: string;
  createdAt: Date;
  updatedAt: Date;
  tag: string;
  imageUrl: string;
  title: string;
  fullname: string;
  deleted: boolean;
  chooseUname: boolean;
  uname: string;
  duration: number;
  audioUrl?: string;
};
