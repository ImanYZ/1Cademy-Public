import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { admin, checkRestartBatchWriteCounts, commitBatch, db } from "../../lib/firestoreServer/admin";

// Logic
// - deleting logged in user, his reputation and his nodes

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let batch = db.batch();
    let writeCounts = 0;
    const user = req.body.data.user;
    const usersRefs = db.collection("users").where("userId", "==", user.uid).limit(1);
    const userDocs = await usersRefs.get();
    if (userDocs.docs.length > 0) {
      const uname = userDocs.docs[0].id;
      const userRef = db.collection("users").doc(uname);
      batch.delete(userRef);
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      const reputationDocs = await db.collection("reputations").where("uname", "==", uname).get();
      for (let reputationDoc of reputationDocs.docs) {
        batch.delete(db.doc(`/reputations/${reputationDoc.id}`));
        [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      }
      const userNodesDocs = await db.collection("userNodes").where("user", "==", uname).get();
      for (let userNodeDoc of userNodesDocs.docs) {
        batch.delete(db.doc(`/userNodes/${userNodeDoc.id}`));
        [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      }
      await commitBatch(batch);
      await admin.auth().deleteUser(user.uid);
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error, success: false });
  }
}

export default fbAuth(handler);
