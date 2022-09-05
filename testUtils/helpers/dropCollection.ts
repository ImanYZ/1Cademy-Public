import { db } from "../../src/lib/firestoreServer/admin";
import isTestEnv from "./isTest";

const dropCollection = async (path: string) => {
  if (!isTestEnv()) return;

  await db.runTransaction(async t => {
    const documentsList = await t.get(db.collection(path));

    for (let document of documentsList.docs) {
      await t.delete(document.ref);
    }
  });
};

export default dropCollection;
