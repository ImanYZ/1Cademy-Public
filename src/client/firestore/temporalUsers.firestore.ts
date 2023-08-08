import { collection, Firestore, getDocs, query } from "firebase/firestore";

type TemporalUsers = {
  id: string;
  username: string;
  imageUrl: string;
};

export const getTemporalUsers = async (db: Firestore): Promise<TemporalUsers[]> => {
  const ref = collection(db, "temporalUsers");
  const q = query(ref);
  const userNodeDoc = await getDocs(q);

  let temporalUsers: TemporalUsers[] = [];

  userNodeDoc.forEach(cur => {
    if (cur.exists()) temporalUsers.push({ id: cur.id, ...cur.data() } as TemporalUsers);
  });

  return temporalUsers;
};
