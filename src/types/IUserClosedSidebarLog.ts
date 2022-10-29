export type IUserClosedSidebarLog = {
  documentId?: string;
  createdAt: Date;
  sidebarType:
    | "Search"
    | "Proposals"
    | "PendingProposals"
    | "Notifications"
    | "UserToolbar"
    | "Presentations"
    | "Media"
    | "AcceptedProposals"
    | "Chat"
    | "BookmarkedUpdates"
    | "UserInfo"
    | "Trends"
    | "RecentNodes"
    | "Citations"
    | "WaitingProposals"
    | "SearchJournals"
    | "UserSettings"
    | "Bookmarks";
  uname: string;
};
