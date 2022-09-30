export type IUserNodeLog = {
  changed: boolean;
  open: boolean;
  updatedAt?: Date;
  wrong: boolean;
  user: string;
  correct: string;
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
