import { checkRestartBatchWriteCounts, db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { uname } = req.body?.data?.user?.userData;
    let batch = db.batch();
    let writeCounts = 0;
    const saveConceptCardsQ = await db.collection("savedBookCards").where("savedBy", "==", uname).get();

    for (let saveCardDoc of saveConceptCardsQ.docs) {
      batch.delete(saveCardDoc.ref);
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      const savedCardData = saveCardDoc.data();
      const flashcardDoc = await db.collection("flashcards").doc(savedCardData.cardId).get();
      if (flashcardDoc.exists) {
        const flashcardData: any = flashcardDoc.data();
        const reactions = flashcardData.reactions || {};
        if (flashcardData) {
          if (reactions[uname]) {
            delete flashcardData.reactions[uname];
          }
          batch.update(flashcardDoc.ref, flashcardData);
          [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        } else {
          console.error("Flashcard not found");
        }
      }
    }

    const commentsDocs = await db.collection("conceptCardComments").get();

    for (let commentDoc of commentsDocs.docs) {
      const commentData = commentDoc.data();
      if (commentData.user.uname === uname) {
        batch.delete(commentDoc.ref);
        [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      } else {
        for (let replyIdx = 0; replyIdx < commentData.replies.length; replyIdx++) {
          const reply = commentData.replies[replyIdx];
          if (reply.user.uname == uname) {
            commentData.replies.splice(replyIdx, 1);
          }
        }
        batch.update(commentDoc.ref, commentData);
        [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      }
    }
    await batch.commit();
    return res.status(200).send({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default fbAuth(handler);
