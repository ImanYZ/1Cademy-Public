import { NextApiRequest, NextApiResponse } from "next";

import {
  admin,
  checkRestartBatchWriteCounts,
  commitBatch,
  db
} from "../../lib/firestoreServer/admin";
import { addToPendingPropsNumsExcludingVoters, getNode, getVersion } from '../../utils';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let batch = db.batch();
    let writeCounts = 0;
    let nodeData, nodeRef, versionData, versionRef;
    const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
    ({ versionData, versionRef } = await getVersion({ versionId: req.body.data.versionId, nodeType: req.body.data.nodeType }));
    if (req.body.data.user.userData.uname === versionData.proposer && !versionData.accepted) {
      ({ nodeData, nodeRef } = await getNode({ nodeId: req.body.data.nodeId }));
      batch.update(versionRef, {
        deleted: true,
        updatedAt: currentTimestamp,
      });
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      batch.update(nodeRef, {
        versions: nodeData.versions - 1,
        updatedAt: currentTimestamp,
      });
      if (!versionData.accepted) {
        // This was a pending proposal for a child node that just got accepted. So, we need to decrement the number of pending proposals for all the members of this community.
        [batch, writeCounts] = await addToPendingPropsNumsExcludingVoters({
          batch,
          nodeType: req.body.data.nodeType,
          versionId: req.body.data.versionId,
          tagIds: versionData.tagIds,
          value: -1,
          writeCounts
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