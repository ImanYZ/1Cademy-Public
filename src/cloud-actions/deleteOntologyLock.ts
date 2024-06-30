import { db } from "./utils/admin";
exports.deleteOntologyLock = async () => {
  try {
    const currentTimestamp = new Date();
    const oneHourAgo = new Date(currentTimestamp);
    oneHourAgo.setHours(currentTimestamp.getHours() - 1);
    const ontologyLockDocs = await db.collection("ontologyLock").where("createdAt", "<", oneHourAgo).get();
    for (let ontologyLock of ontologyLockDocs.docs) {
      ontologyLock.ref.delete();
    }
  } catch (error) {
    console.log("deleteOntologyLock", error);
  }
};
