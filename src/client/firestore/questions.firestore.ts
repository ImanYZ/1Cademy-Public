import { collection, doc, Firestore, setDoc, Timestamp } from "firebase/firestore";

export type Rubrics = {
  prompt: string;
  upvotes: number;
  downvotes: number;
};

export type AddQuestionInput = {
  title: string;
  description: string;
  imageUrl: string;
  rubrics: Rubrics[];
};

type QuestionDocument = {
  title: string;
  description: string;
  imageUrl: string;
  createdAt: Date;
  rubrics: Rubrics[];
};
export type Question = { id: string } & QuestionDocument;

export const addQuestion = async (db: Firestore, data: AddQuestionInput): Promise<void> => {
  const reference = doc(collection(db, "questions"));
  await setDoc(reference, { ...data, createdAt: Timestamp.fromDate(new Date()) });
};
