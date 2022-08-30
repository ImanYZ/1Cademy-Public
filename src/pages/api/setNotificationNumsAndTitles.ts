import { NextApiRequest, NextApiResponse } from "next";

import { checkRestartBatchWriteCounts, commitBatch, db } from "../../lib/firestoreServer/admin";
import { setOrIncrementNotificationNums } from '../../utils';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let batch = db.batch();
    let writeCounts = 0;

    const nodeTitles: any = {};
    const nodesDocs = await db.collection("nodes").get();
    for (let nodeDoc of nodesDocs.docs) {
      const nodeData = nodeDoc.data();
      nodeTitles[nodeDoc.id] = nodeData.title;
    }

    const notificationsDocs = await db.collection("notifications").get();
    for (let notificationDoc of notificationsDocs.docs) {
      const notificationData = notificationDoc.data();
      const notificationRef = db.collection("notifications").doc(notificationDoc.id);
      batch.update(notificationRef, { title: nodeTitles[notificationData.nodeId] });
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      [batch, writeCounts] = await setOrIncrementNotificationNums({
        batch,
        proposer: notificationData.proposer,
        writeCounts
      });
    }

    await commitBatch(batch);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default handler;