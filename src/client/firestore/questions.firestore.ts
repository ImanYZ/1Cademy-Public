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

export type RubricItemType = { prompt: string; point: number };
export type Rubric = {
  id: string;
  questionId: string;
  prompts: RubricItemType[];
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
  loadingRubrics?: boolean;
  errorLoadingRubrics?: boolean;
};

export type UpdateQuestionInput = Partial<AddQuestionInput>;

type QuestionDocument = {
  title: string;
  description: string;
  imageUrl: string;
  rubrics: Rubric[];
  loadingRubrics?: boolean;
  errorLoadingRubrics?: boolean;
};
export type Question = { id: string; createdAt: Date } & QuestionDocument;

export type QuestionChanges = {
  data: { createdAt: Timestamp; id: string } & QuestionDocument;
  type: SnapshotChangesTypes;
};

export const addQuestion = async (db: Firestore, data: AddQuestionInput): Promise<string> => {
  const reference = doc(collection(db, "questions"));
  await setDoc(reference, {
    ...data,
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date()),
  });
  return reference.id;
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
      const document = change.doc.data() as { createdAt: Timestamp } & QuestionDocument;
      return { type: change.type, data: { id: change.doc.id, ...document } };
    });

    callback(questionDocuments);
  });
  return killSnapshot;
};
