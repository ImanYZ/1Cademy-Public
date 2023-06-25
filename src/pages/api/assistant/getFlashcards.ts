import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { IAssistantNodePassage } from "src/types/IAssistant";
import { Flashcard } from "src/types/IAssitantConversation";
import { findPassagesBySelection, getFlashcardsFromPassage } from "src/utils/assistant-helpers";

export type IAssistantGetTopicPayload = {
  url?: string;
  passage: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const flashcards: Flashcard[] = [];
    const payload = req.body as IAssistantGetTopicPayload;
    if (payload.url) {
      const passages = (await findPassagesBySelection(payload.passage, payload.url)) || [];
      if (passages.length) {
        for (const passage of passages) {
          const bookPassage = passage.data() as IAssistantNodePassage;
          for (const flashcard of bookPassage.flashcards) {
            flashcard.passageId = passage.id;
            flashcards.push(flashcard);
          }
        }

        return res.status(200).json({
          topic: flashcards,
        });
      }
    }

    const bookPassageRef = db.collection("bookPassages").doc();
    const _flashcards = await getFlashcardsFromPassage(payload.passage);
    for (const _flashcard of _flashcards) {
      _flashcard.passageId = bookPassageRef.id;
      flashcards.push(_flashcard);
    }

    const bookPassage: IAssistantNodePassage = {
      contextPassage: "",
      passage: payload.passage,
      flashcards,
      urls: [payload.url!],
    };
    await bookPassageRef.set(bookPassage);

    return res.status(200).json({
      topic: bookPassage.flashcards,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default handler;
