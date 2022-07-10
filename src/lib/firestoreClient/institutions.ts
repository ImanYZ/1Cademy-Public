import { collection, getDocs, query, where } from "firebase/firestore/lite";

import { dbClient } from "./firestoreClient.config";

export const getInstitutionsByName = async (names: string[]) => {
  const institutionsRef = collection(dbClient, "institutions");
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
