import { NextApiRequest, NextApiResponse } from "next";

import { checkRestartBatchWriteCounts, commitBatch, db } from "../../lib/firestoreServer/admin";
import { fetchGoogleMapsGeolocationWrapper } from "../../utils";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let batch = db.batch();
    let writeCounts = 0;

    for (let attr of ["lng", "lat"]) {
      const instDocs = await db.collection("institutions").where(attr, "==", -1).get();
      for (let instDoc of instDocs.docs) {
        const instData = instDoc.data();
        const geoLoc = await fetchGoogleMapsGeolocationWrapper(instData.institution);
        if (geoLoc.lng === -1 || geoLoc.lat === -1) {
          const instRef = db.collection("institutions").doc(instDoc.id);
          batch.update(instRef, {
            lat: geoLoc.lat,
            lng: geoLoc.lng,
          });
          [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        }
      }
      await commitBatch(batch);
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default handler;
