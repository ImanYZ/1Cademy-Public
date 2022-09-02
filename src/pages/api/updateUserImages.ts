import { NextApiRequest, NextApiResponse } from "next";

import { admin, commitBatch, db } from "../../lib/firestoreServer/admin";
import { updateUserImageEverywhere } from "../../utils";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let batch = db.batch();
    let writeCounts = 0;

    const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
    const usersDocs = await db.collection("users").get();
    for (let userDoc of usersDocs.docs) {
      const userData = userDoc.data();
      const uname = userData.uname;
      console.log(uname);
      const imageUrl = userData.imageUrl;
      // It generates false or the value of the attribute.
      const chooseUname = "chooseUname" in userData && userData.chooseUname;
      [batch, writeCounts] = await updateUserImageEverywhere({
        batch,
        uname,
        imageUrl,
        fullname: userData.fName + " " + userData.lName,
        chooseUname,
        currentTimestamp,
        writeCounts,
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
