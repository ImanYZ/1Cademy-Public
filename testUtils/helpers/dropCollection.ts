import { commitBatch, db } from "../../src/lib/firestoreServer/admin"
const dropCollection = async (path: string) => {
  const batch = db.batch()
  const documentsList = await db.collection(path).listDocuments()

  for (let document of documentsList) {
    batch.delete(document)
  }
  await commitBatch(batch)
}

export default dropCollection
