export type IUserBackgroundLog = {
  documentId?: string;
  uname: string;
  background: "Color" | "Image";
  createdAt: Date;
};
