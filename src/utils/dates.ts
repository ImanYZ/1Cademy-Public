import { SimpleNode2 } from "src/types";

export const timeAgo = (days: number): Date => {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - days);
  return currentDate;
};

export const filterOnDaysAgo = (data: SimpleNode2[], daysAgo: number): SimpleNode2[] => {
  return data.filter(
    data => data.changedAt && new Date(data.changedAt) >= timeAgo(daysAgo) && new Date(data.changedAt) <= new Date()
  );
};
