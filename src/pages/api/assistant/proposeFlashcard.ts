import { db } from "@/lib/firestoreServer/admin";
import { Timestamp } from "firebase-admin/firestore";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { IAssistantNodePassage } from "src/types/IAssistant";
import { Flashcard } from "src/types/IAssitantConversation";
import { IUser } from "src/types/IUser";
import { findPassagesBySelection } from "src/utils/assistant-helpers";

export type IAssistantProposeFlashcardPayload = {
  url: string; // book url
  passageId: string;
  title: string; // flashcard title
  node?: string;
  version: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    let flashcard: Flashcard | null = null;
    const payload = req.body as IAssistantProposeFlashcardPayload;
    const passage = await db.collection("bookPassages").doc(payload.passageId).get();
    const userData = req.body.data.user.userData as IUser;

    const bookPassage = passage.data() as IAssistantNodePassage;
    for (const _flashcard of bookPassage?.flashcards || []) {
      if (_flashcard.title === payload.title) {
        flashcard = _flashcard;
        break;
      }
    }

    if (flashcard && passage) {
      const bookPassageRef = db.collection("bookPassages").doc(passage.id);
      const bookPassage = passage.data() as IAssistantNodePassage;
      const flashcardIdx = bookPassage.flashcards.findIndex(_flashcard => _flashcard.title === flashcard?.title);
      bookPassage.flashcards[flashcardIdx] = flashcard;

      if (payload.node) {
        flashcard.node = payload.node;
      }
      flashcard.proposer = userData.uname;
      flashcard.proposal = payload.version;
      flashcard.proposed = true;

      await bookPassageRef.update({
        flashcards: bookPassage.flashcards,
        updatedAt: Timestamp.now(),
      });
    }
    return res.status(200).json({});
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default fbAuth(handler);
