import { SimpleNode } from "src/knowledgeTypes";

export const timeAgo = (days: number): Date => {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - days);
  return currentDate;
};

export const filterOnDaysAgo = (data: SimpleNode[], daysAgo: number): SimpleNode[] => {
  return data.filter(
    data => data.changedAt && new Date(data.changedAt) >= timeAgo(daysAgo) && new Date(data.changedAt) <= new Date()
  );
};
