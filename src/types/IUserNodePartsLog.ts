export type IUserNodePartsLog = {
  documentId?: string;
  uname: string;
  partType: "LinkingWords" | "References" | "Tags";
  createdAt: Date;
  nodeId: string;
};
