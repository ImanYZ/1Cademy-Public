import { NextApiRequest, NextApiResponse } from "next";

import { checkRestartBatchWriteCounts, commitBatch, db } from "../../lib/firestoreServer/admin";
import { comPointTypes } from '../../utils';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let writeCounts = 0;
    let batch = db.batch();
    const tagCommunities = ["tags", ...comPointTypes];
    for (let tagCommunity of tagCommunities) {
      const tagsDocs = await db.collection(tagCommunity).get();
      //  obtain all tags that are not deleted
      for (let tagDoc of tagsDocs.docs) {
        const tagRef = db.collection(tagCommunity).doc(tagDoc.id);
        batch.delete(tagRef);
        [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      }
    }
    await commitBatch(batch);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default handler;