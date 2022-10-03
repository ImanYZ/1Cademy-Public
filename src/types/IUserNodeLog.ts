export type IUserNodeLog = {
  documentId?: string;
  changed: boolean;
  open: boolean;
  updatedAt?: Date;
  correct: boolean;
  wrong: boolean;
  user: string;
  node: string;
  isStudied: boolean;
  visible: boolean;
  isAdmin?: boolean; // removed
  createdAt: Date;
  deleted: boolean;
  height?: boolean; // removed
  closedHeight?: boolean; // removed
  bookmarked?: boolean;
  userNodeId?: string; // removed
  lastVisit?: string; // removed
  firstVisit?: string; // removed
};
