import { db } from "@/lib/firestoreServer/admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { IAssistantNodePassage } from "src/types/IAssistant";
import { Flashcard } from "src/types/IAssitantConversation";
import { IUser } from "src/types/IUser";
import { findPassagesBySelection } from "src/utils/assistant-helpers";

export type IAssistantProposeFlashcardPayload = {
  url: string; // section or book url
  passageId: string;
  title: string; // flashcard title
  node?: string;
  version: string;
  flashcard: Flashcard;
  flashcardId: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const payload = req.body as IAssistantProposeFlashcardPayload;
    const userData = req.body.data.user.userData as IUser;
    console.log("assistant/proposeFlashcard", payload);
    if (payload.passageId) {
      const passageDoc = await db.collection("chaptersBook").doc(payload.passageId).get();

      const bookPassage = passageDoc.data() as IAssistantNodePassage;
      const flashcard: Flashcard | undefined = bookPassage?.flashcards.find(f => f.id === payload.flashcardId);

      if (flashcard && passageDoc.exists) {
        if (payload.node) {
          flashcard.node = payload.node;
        }
        flashcard.proposer = userData.uname;
        flashcard.proposal = payload.version;
        flashcard.proposed = true;

        flashcard.userImage = userData.imageUrl;
        flashcard.user = userData.uname;
        flashcard.fullname = `${userData.fName} ${userData.lName}`;

        await passageDoc.ref.update({
          flashcards: bookPassage.flashcards,
          updatedAt: Timestamp.now(),
        });
        if (payload.node) {
          const nodeRef = db.collection("nodes").doc(payload.node);
          await nodeRef.update({
            linkedFlashcards: FieldValue.arrayUnion({
              flashcardId: payload.flashcardId,
              documentId: payload.passageId,
            }),
          });
        }
      }
    }
    return res.status(200).json({ nodeId: payload.node });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default fbAuth(handler);
