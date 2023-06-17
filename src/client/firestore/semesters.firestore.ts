import { doc, Firestore, getDoc } from "firebase/firestore";

import { ISemester } from "../../types/ICourse";

export const getSemesterById = async (db: Firestore, semesterId: string): Promise<ISemester | null> => {
  console.log({ db, semesterId });
  const q = doc(db, "semesters", semesterId);
  const document = await getDoc(q);
  if (!document.exists()) return null;
  return document.data() as ISemester;
};
