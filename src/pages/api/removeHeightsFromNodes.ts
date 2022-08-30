import { NextApiRequest, NextApiResponse } from "next";

import {
  admin,
  checkRestartBatchWriteCounts,
  commitBatch,
  db,
} from "../../lib/firestoreServer/admin";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let batch = db.batch();
    let writeCounts = 0;

    const nodesDocs = await db.collection("Nodes").get();
    for (let nodeDoc of nodesDocs.docs) {
      const nodeData = nodeDoc.data();
      const nodeUpdates: any = {};
      if ("height" in nodeData) {
        nodeUpdates.height = admin.firestore.FieldValue.delete();
      }
      if ("closedHeight" in nodeData) {
        nodeUpdates.closedHeight = admin.firestore.FieldValue.delete();
      }
      const nodeRef = db.collection("nodes").doc(nodeDoc.id);
      batch.update(nodeRef, nodeUpdates);
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