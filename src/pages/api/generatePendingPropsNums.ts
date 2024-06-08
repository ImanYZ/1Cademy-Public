import { NextApiRequest, NextApiResponse } from "next";

import { commitBatch, db } from "../../lib/firestoreServer/admin";
import { addToPendingPropsNumsExcludingVoters, getTypedCollections } from "../../utils";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let batch = db.batch();
    let writeCounts = 0;

    const { versionsColl }: any = getTypedCollections();
    const versionsDocs = await versionsColl.get();
    for (let versionDoc of versionsDocs.docs) {
      const versionData = versionDoc.data();
      if (!versionData.accepted) {
        [batch, writeCounts] = await addToPendingPropsNumsExcludingVoters({
          batch,
          nodeType: versionData.nodeType,
          versionId: versionDoc.id,
          tagIds: versionData.tagIds,
          value: 1,
          writeCounts,
          t: null,
          tWriteOperations: null,
        });
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
