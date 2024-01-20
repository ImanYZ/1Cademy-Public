import { db } from "../admin";
export const removeReactionFromCard = async (data: any) => {
  try {
    const doer = data.savedBy;
    const flashcardId = data.cardId;

    await db.runTransaction(async (transaction: any) => {
      const flashcardDoc = await transaction.get(db.collection("flashcards").doc(flashcardId));
      const flashcardData = flashcardDoc.data();
      const reactions = flashcardData.reactions || {};
      console.log(flashcardData);
      if (flashcardData) {
        if (reactions[doer]) {
          delete flashcardData.reactions[doer];
        }
        transaction.update(flashcardDoc.ref, { reactions });
      } else {
        console.error("Flashcard not found");
      }
    });
  } catch (error) {
    console.log("removeReactionFromCard", error);
  }
};
