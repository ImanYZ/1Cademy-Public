import { NextApiRequest, NextApiResponse } from "next";

import { checkRestartBatchWriteCounts, commitBatch, db } from "../../lib/firestoreServer/admin";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let batch = db.batch();
    let writeCounts = 0;
    const userNodesDocs = await db.collection("userNodes").get();
    for (let userNodeDoc of userNodesDocs.docs) {
      const userNodeData = userNodeDoc.data();
      if ("isAdmin" in userNodeData) {
        delete userNodeData.isAdmin;
      }
      const userNodeRef = db.collection("userNodes").doc(userNodeDoc.id);
      batch.set(userNodeRef, userNodeData);
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    }
    await commitBatch(batch);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default handler;
