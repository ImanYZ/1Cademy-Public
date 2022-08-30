import { NextApiRequest, NextApiResponse } from "next";

import { admin, commitBatch, db } from "../../lib/firestoreServer/admin";
import { updateUserImageEverywhere } from '../../utils';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let writeCounts = 0;
    let batch = db.batch();

    const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
    const userRef = db.doc(`/users/${req.body.data.user.userData.uname}`);
    batch.update(userRef, {
      imageUrl: req.body.data.imageUrl,
      updatedAt: currentTimestamp,
    });
    writeCounts += 1;
    const userData = req.body.data.user.userData;
    const chooseUname = "chooseUname" in userData && userData.chooseUname;
    [batch, writeCounts] = await updateUserImageEverywhere({
      batch,
      uname: req.body.data.user.userData.uname,
      imageUrl: req.body.data.imageUrl,
      fullname: userData.fName + " " + userData.lName,
      chooseUname,
      currentTimestamp,
      writeCounts
    });
    await commitBatch(batch);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error, success: false });
  }
}

export default handler;
