import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";

import { admin, checkRestartBatchWriteCounts, commitBatch, db } from "../../../lib/firestoreServer/admin";
import { firstWeekMonthDays, initializeNewReputationData, reputationTypes } from "../../../utils";

// TODO: its not checking if that node exist or not. or if has isTag or not
// Logic
// ignore if tag id is equal user.tagId and respond with 200
// check if reputation documents exists for that user in that new tag or not.
// - if not create reputation docs for each type
// check if selected tag has credit doc in credits collection or not
// - if not create credit doc
// update user doc in users collection and set selected tag Id and title
async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let tagNodeId = req.query.deTagNode as string;
    const { user } = req.body.data as any;

    if (user.userData.tagId !== tagNodeId) {
      let createdAt = admin.firestore.Timestamp.fromDate(new Date());
      let updatedAt = createdAt;
      const { firstWeekDay, firstMonthDay } = firstWeekMonthDays();
      const tagNodeDoc = await db.collection("nodes").doc(tagNodeId).get();
      const tagNode: any = tagNodeDoc.data();
      const tag = tagNode.title;

      let batch = db.batch();
      let writeCounts = 0;
      let reputationsQuery, reputationsDoc;
      for (let reputationType of reputationTypes) {
        //  change tag to tageNodeId after data is updated
        reputationsQuery = db
          .collection(reputationType)
          .where("uname", "==", user.userData.uname)
          .where("tagId", "==", tagNodeId);
        if (reputationType === "Monthly" || reputationType === "Others Monthly") {
          reputationsQuery = reputationsQuery.where("firstMonthDay", "==", firstMonthDay);
        } else if (reputationType === "Weekly" || reputationType === "Others Weekly") {
          reputationsQuery = reputationsQuery.where("firstWeekDay", "==", firstWeekDay);
        }
        reputationsDoc = await reputationsQuery.limit(1).get();
        if (reputationsDoc.docs.length === 0) {
          reputationsDoc = db.collection(reputationType).doc();
          const reputationObj = initializeNewReputationData({
            tagId: tagNodeId,
            tag,
            updatedAt,
            createdAt,
          });
          reputationObj.uname = user.userData.uname;
          if (reputationType === "Monthly" || reputationType === "Others Monthly") {
            reputationObj.firstMonthDay = firstMonthDay;
          } else if (reputationType === "Weekly" || reputationType === "Others Weekly") {
            reputationObj.firstWeekDay = firstWeekDay;
          }
          batch.set(reputationsDoc, reputationObj);
          [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        }
      }

      let creditsQuery = db
        .collection("credits")
        // .where("credits", "==", user.userData.deCredits)
        .where("tagId", "==", tagNodeId)
        .limit(1);
      let creditsDoc = await creditsQuery.get();

      if (creditsDoc.docs.length === 0) {
        const creditDoc = db.collection("credits").doc();
        batch.set(creditDoc, {
          createdAt,
          credits: user.userData.deCredits,
          deepA: 750,
          deepAInst: 210,
          iInstValue: 4,
          iValue: 10,
          ltermA: 1375,
          meanA: 300,
          meanAInst: 84,
          tag,
          tagId: tagNodeId,
        });
        [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      }
      const userDoc = db.collection("users").doc(user.userData.uname);
      batch.update(userDoc, {
        tag: tag,
        tagId: tagNodeId,
        updatedAt,
      });

      await commitBatch(batch);
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default fbAuth(handler);
