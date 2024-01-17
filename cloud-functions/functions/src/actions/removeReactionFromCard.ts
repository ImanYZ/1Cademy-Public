import { db } from "../admin";
export const removeReactionFromCard = async (data: any) => {
  try {
    const doer = data.savedBy;
    const flashcardId = data.cardId;
    const documentId = data.passageId;

    await db.runTransaction(async transaction => {
      const bookDoc = await transaction.get(db.collection("chaptersBook").doc(documentId));
      const bookData = bookDoc.data();
      if (bookData) {
        const flashcards = bookData.flashcards || [];

        const flashcardIdx = flashcards.findIndex((f: any) => f.id === flashcardId);

        if (flashcardIdx !== -1) {
          if (flashcards[flashcardIdx].reactions && flashcards[flashcardIdx].reactions[doer]) {
            delete flashcards[flashcardIdx].reactions[doer];
          }
          transaction.update(bookDoc.ref, { flashcards });
        } else {
          console.error("Flashcard not found");
        }
      }
    });
  } catch (error) {
    console.log("removeReactionFromCard", error);
  }
};
