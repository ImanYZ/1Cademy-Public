export type IUserOpenSidebarLog = {
  documentId?: string;
  uname: string;
  sidebarType:
    | "PendingProposals"
    | "Notifications"
    | "Search"
    | "Chat"
    | "Trends"
    | "RecentNodes"
    | "Presentations"
    | "BookmarkedUpdates"
    | "Bookmarks"
    | "WaitingProposals";
  createdAt: Date;
  selectedUser?: string;
};
