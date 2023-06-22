import { collection, Firestore, getDocs, query, where } from "firebase/firestore";

import { ISemesterStudentVoteStat } from "../../types/ICourse";

export const getSemesterStudentVoteStats = async (
  db: Firestore,
  semesterId: string
): Promise<ISemesterStudentVoteStat[]> => {
  const q = query(collection(db, "semesterStudentVoteStats"), where("tagId", "==", semesterId));
  const documents = await getDocs(q);
  const result: ISemesterStudentVoteStat[] = [];
  documents.forEach(c => c.exists() && result.push(c.data() as ISemesterStudentVoteStat));
  return result;
};

export const getSemesterStudentVoteStatsByIdAndStudent = async (
  db: Firestore,
  semesterId: string,
  uname: string
): Promise<ISemesterStudentVoteStat | null> => {
  const q = query(
    collection(db, "semesterStudentVoteStats"),
    where("tagId", "==", semesterId),
    where("uname", "==", uname)
  );
  const documents = await getDocs(q);
  const result: ISemesterStudentVoteStat[] = [];
  documents.forEach(c => c.exists() && result.push(c.data() as ISemesterStudentVoteStat));
  return result[0] ?? null;
};
