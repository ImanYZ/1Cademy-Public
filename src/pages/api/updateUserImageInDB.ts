import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";

import { admin, commitBatch, db } from "../../lib/firestoreServer/admin";
import { updateUserImageEverywhere } from "../../utils";

// TODO: only allow white listed hosts to be used in image urls.
// TODO: remove XSS vulnerability
// Logic
// - find user and update image url in users collection
// - change user images in each collection that have user image
//   - nodeComments (not implemented)
//   - messages
//   - notifications
//   - presentations (not implemented)
//   - comPoints, comMonthlyPoints, comWeeklyPoints, comOthersPoints, comOthMonPoints, comOthWeekPoints
//   - schoolPoints, schoolMonthlyPoints, schoolWeeklyPoints, schoolOthersPoints, schoolOthMonPoints, schoolOthWeekPoints (not implemented)
//   - {nodeType}Versions, {nodeType}VersionComments (comments not implemented)
//   - nodes where this user is admin
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
      writeCounts,
    });
    await commitBatch(batch);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error, success: false });
  }
}

export default fbAuth(handler);
