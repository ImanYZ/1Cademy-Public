import { Notebook } from "../../types";
import { db } from "./admin";

export const getNotebookById = async (notebookId: string): Promise<Notebook | null> => {
  const notebookDoc = await db.collection("notebooks").doc(notebookId).get();
  if (!notebookDoc.exists) return null;
  return { ...notebookDoc.data(), id: notebookId } as Notebook;
};
