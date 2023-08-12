import { collection, doc, Firestore, getDocs, query, setDoc, Timestamp, updateDoc, where } from "firebase/firestore";

export type AddAnswerInput = {
  user: string;
  userImage: string;
  question: string;
  answer: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateAnswerInput = Partial<AddAnswerInput>;

type AnswerDocument = {
  user: string;
  userImage: string;
  question: string;
  answer: string;
  createdAt: Date;
  updatedAt: Date;
};
export type Answer = { id: string } & AnswerDocument;

export const getAnswersByQuestion = async (db: Firestore, questionId: string): Promise<Answer[]> => {
  const ref = collection(db, "answers");
  const q = query(ref, where("question", "==", questionId));
  const answersDoc = await getDocs(q);

  let answers: Answer[] = [];

  answersDoc.forEach(cur => {
    if (cur.exists()) answers.push({ id: cur.id, ...cur.data() } as Answer);
  });

  return answers;
};

export const addAnswer = async (db: Firestore, id: string, data: AddAnswerInput): Promise<void> => {
  const reference = doc(db, "answers", id);
  await setDoc(reference, {
    ...data,
  });
};

export const updateAnswer = async (db: Firestore, id: string, data: UpdateAnswerInput): Promise<void> => {
  const reference = doc(db, "answers", id);
  await updateDoc(reference, { ...data, updatedAt: Timestamp.fromDate(new Date()) });
};
