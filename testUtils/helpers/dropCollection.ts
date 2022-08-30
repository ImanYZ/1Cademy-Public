import { commitBatch, db } from "../../src/lib/firestoreServer/admin";
import isTestEnv from "./isTest";

const dropCollection = async (path: string) => {
  if (!isTestEnv()) return;
  const batch = db.batch();
  const documentsList = await db.collection(path).listDocuments();

  for (let document of documentsList) {
    batch.delete(document);
  }
  await commitBatch(batch);
};

export default dropCollection;
