export type IUserLeaderboardLog = {
  documentId?: string;
  type: "All Time" | "Weekly" | "Others' Votes" | "Monthly" | "Others Monthly";
  createdAt: Date;
  uname: string;
};
