import { collection, doc, Firestore, setDoc, Timestamp } from "firebase/firestore";
import { ClientErrorType } from "src/types";

export type ErrorLog = {
  user: string;
  title: ClientErrorType;
  level?: "INFO" | "WARNING" | "ERROR";
  description?: string;
  data: { [key: string]: any };
};

export const addClientErrorLog = async (db: Firestore, data: ErrorLog): Promise<void> => {
  const errorsRef = doc(collection(db, "logs"));
  const dataCompleted: ErrorLog = { ...data, level: data.level ?? "ERROR" };
  await setDoc(errorsRef, { ...dataCompleted, createdAt: Timestamp.fromDate(new Date()) });
};
