import { INotebook } from "../../types";
import { db } from "./admin";

export const getNotebookById = async (notebookId: string): Promise<INotebook | null> => {
  const notebookDoc = await db.collection("notebooks").doc(notebookId).get();
  if (!notebookDoc.exists) return null;
  return { ...JSON.parse(JSON.stringify(notebookDoc.data())), id: notebookId } as INotebook;
};
