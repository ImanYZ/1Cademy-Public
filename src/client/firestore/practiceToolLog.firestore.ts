import { collection, doc, Firestore, setDoc, Timestamp } from "firebase/firestore";

type PracticeToolLog = {
  user: string;
  semesterId: string;
  byVoice: boolean;
  //   transcript: string;
  //   transcriptProcessed: string;
  action:
    | "submit" //x
    | "next-question" // x
    | "start-assistant" //x
    | "stop-assistant" //x
    | "open-leaderboard" //x
    | "open-user-status" //x
    | "open-notebook"
    | "display-tags"; //x
};

export const addPracticeToolLog = async (db: Firestore, data: PracticeToolLog): Promise<void> => {
  const practiceToolLogRef = doc(collection(db, "practiceToolLog"));
  await setDoc(practiceToolLogRef, { ...data, createdAt: Timestamp.fromDate(new Date()) });
};
