export type ITag = {
  documentId?: string;
  tagIds: string[];
  tags: string[];
  node: string;
  title: string;
  deleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
};
