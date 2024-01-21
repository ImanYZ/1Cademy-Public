import { batchUpdate, commitBatch, db } from "../admin";
export const updateSavedCards = async (newData: any, cardId: string) => {
  try {
    const savedCardsDocs = await db.collection("savedBookCards").where("cardId", "==", cardId).get();
    for (let cardDoc of savedCardsDocs.docs) {
      batchUpdate(cardDoc.ref, newData);
    }
    await commitBatch();
  } catch (error) {
    console.log("removeReactionFromCard", error);
  }
};
