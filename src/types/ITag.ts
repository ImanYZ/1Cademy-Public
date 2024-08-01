export type ITag = {
  documentId?: string;
  tagIds: string[];
  tags: string[];
  node: string;
  title: string;
  nodesNum: number;
  deleted?: boolean;
  createdAt: Date;
  updatedAt: Date;

  tag?: string; //added for other collection other than "tags"
};
