import { NextApiRequest, NextApiResponse } from "next";

import {
  checkRestartBatchWriteCounts,
  commitBatch,
  db,
  publicStorageBucket
} from "../../lib/firestoreServer/admin";
import { EDITED_UNIVERSITIES, fetchGoogleMapsGeolocationWrapper } from '../../utils';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let writeCounts = 0;
    let batch = db.batch();
    const colDocs = await db.collection("institutions").get();
    for (let colDoc of colDocs.docs) {
      const docRef = db.collection("institutions").doc(colDoc.id);
      batch.delete(docRef);
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    }
    await commitBatch(batch);
    console.log("Deleted all institutions.");

    const rawdata: any = EDITED_UNIVERSITIES;
    const institutionsData = JSON.parse(rawdata);
    let instRef, instDocs;
    let userDocs: any = await db.collection("users").get();
    userDocs = [...userDocs.docs];
    for (let instObj of institutionsData) {
      for (let userDoc of userDocs) {
        const userData = userDoc.data();
        const domainName = userData.email.match("@(.+)$")[0];
        if (
          (domainName.includes(instObj.domains) && domainName !== "@bgsu.edu") ||
          (instObj.domains === "bgsu.edu" && domainName === "@bgsu.edu")
        ) {
          console.log({ username: userData.uname, instObj });
          const userRef = db.collection("users").doc(userDoc.id);
          await userRef.update({ deInstit: instObj.name });
          instDocs = await db
            .collection("institutions")
            .where("name", "==", instObj.name)
            .limit(1)
            .get();
          if (instDocs.docs.length > 0) {
            instRef = db.collection("institutions").doc(instDocs.docs[0].id);
            const institData = instDocs.docs[0].data();
            const instDomains = [...institData.domains];
            if (!instDomains.includes(domainName)) {
              instDomains.push(domainName);
            }
            await instRef.update({
              usersNum: institData.usersNum + 1,
              domains: instDomains,
            });
          } else {
            instRef = db.collection("institutions").doc();
            try {
              const geoLoc = await fetchGoogleMapsGeolocationWrapper(instObj.name);
              await instRef.set({
                country: instObj.country,
                lng: geoLoc.lng,
                lat: geoLoc.lat,
                domains: [domainName],
                logoURL: encodeURI(
                  `https://storage.googleapis.com/${publicStorageBucket}/Logos/${instObj.name}.png`
                ),
                name: instObj.name,
                usersNum: 1,
              });
            } catch (err) {
              console.log(err);
            }
          }
        }
      }
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default handler;