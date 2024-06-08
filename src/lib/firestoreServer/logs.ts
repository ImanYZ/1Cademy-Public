import { db } from "./admin";

export const saveLogs = async (logs: { [key: string]: any }) => {
  const newLogRef = db.collection("logs").doc();
  await newLogRef.set({
    project: "1Cademy",
    ...logs,
    createdAt: new Date(),
  });
};
