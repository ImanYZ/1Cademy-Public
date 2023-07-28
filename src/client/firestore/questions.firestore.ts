import { collection, doc, Firestore, setDoc, Timestamp } from "firebase/firestore";

export type Rubrick = {
  prompt: string;
  upvotes: number;
  downvotes: number;
};

export type AddQuestionInput = {
  title: string;
  description: string;
  imageUrl: string;
  rubricks: Rubrick[];
};

type QuestionDocument = {
  title: string;
  description: string;
  imageUrl: string;
  createdAt: Date;
  rubricks: {
    promt: string;
    upvotes: number;
    downvotes: number;
  }[];
};
export type Question = { id: string } & QuestionDocument;

export const addQuestion = async (db: Firestore, data: AddQuestionInput): Promise<void> => {
  const reference = doc(collection(db, "questions"));
  await setDoc(reference, { ...data, createdAt: Timestamp.fromDate(new Date()) });
};
