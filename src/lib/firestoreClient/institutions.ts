import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";

export const getInstitutionsByName = async (names: string[]) => {
  const db = getFirestore();
  const institutionsRef = collection(db, "institutions");
  const res = await Promise.all(
    names.map(async institutionName => {
      const q = query(institutionsRef, where("name", "==", institutionName));
      const querySnapshot = await getDocs(q);
      const result: { name: string; logoURL: string; id: string }[] = [];
      querySnapshot.forEach(doc => {
        const institutionDoc = doc.data();
        result.push({ name: institutionDoc.name, logoURL: institutionDoc.logoURL, id: doc.id });
      });
      return result;
    })
  );
  return res.flat();
};
