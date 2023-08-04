import {
  collection,
  doc,
  Firestore,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  Unsubscribe,
  updateDoc,
} from "firebase/firestore";
import { SnapshotChangesTypes } from "src/types";

export type Rubric = {
  id: string;
  questionId: string;
  points: number;
  prompts: string[];
  upvotesBy: string[];
  downvotesBy: string[];
  createdBy: string;
};

export type AddQuestionInput = {
  user: string;
  title: string;
  description: string;
  imageUrl: string;
  rubrics: Rubric[];
};

export type UpdateQuestionInput = Partial<AddQuestionInput>;

type QuestionDocument = {
  title: string;
  description: string;
  imageUrl: string;
  createdAt: Date;
  rubrics: Rubric[];
};
export type Question = { id: string } & QuestionDocument;

export type QuestionChanges = {
  data: Question;
  type: SnapshotChangesTypes;
};

export const addQuestion = async (db: Firestore, data: AddQuestionInput): Promise<void> => {
  const reference = doc(collection(db, "questions"));
  await setDoc(reference, {
    ...data,
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date()),
  });
};

export const updateQuestion = async (db: Firestore, id: string, data: UpdateQuestionInput): Promise<void> => {
  const reference = doc(db, "questions", id);
  await updateDoc(reference, { ...data, updatedAt: Timestamp.fromDate(new Date()) });
};

export const getQuestionSnapshot = (
  db: Firestore,
  data: {
    /*  username: string */
  },
  callback: (questions: QuestionChanges[]) => void
): Unsubscribe => {
  const questionsRef = collection(db, "questions");
  // INFO: when create assignments, change user to assignment and update DB with a script
  const q = query(questionsRef /* , where("user", "==", data.username) */);
  const killSnapshot = onSnapshot(q, snapshot => {
    const docChanges = snapshot.docChanges();

    const questionDocuments: QuestionChanges[] = docChanges.map(change => {
      const document = change.doc.data() as QuestionDocument;
      return { type: change.type, data: { id: change.doc.id, ...document } };
    });

    callback(questionDocuments);
  });
  return killSnapshot;
};
