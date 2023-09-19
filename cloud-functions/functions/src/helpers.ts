const { db, commitBatch, batchUpdate } = require("./admin");

export const signalFlashcardChanges = async (nodeId: string, type: string) => {
  const nodeDoc = await db.collection("nodes").doc(nodeId).get();
  const nodeData = nodeDoc.data();
  if (nodeData && nodeData.hasOwnProperty("linkedFlashcards")) {
    const linkedFlashcards = nodeData.linkedFlashcards;
    for (let linkedF of linkedFlashcards) {
      const passageDoc = await db.collection("chaptersBook").doc(linkedF.documentId).get();

      const flashcards = passageDoc.data()?.flashcards;

      let needUpdate = false;
      flashcards.forEach((flashcard: any) => {
        if (flashcard.node === nodeId) {
          needUpdate = true;
          if (type === "delete") {
            flashcard.proposed = false;
            flashcard.node = "";
            flashcard.proposal = "";
          } else if (type === "update") {
            flashcard.content = nodeData.content;
            flashcard.title = nodeData.title;
            flashcard.fullname = nodeData.aFullname;
            flashcard.user = nodeData.admin;
            flashcard.userImage = nodeData.aImgUrl;
          }
        }
      });
      if (needUpdate) {
        await batchUpdate(passageDoc.ref, { flashcards, updatedAt: new Date() });
      }
    }
  }
  await commitBatch();
};
