import { db } from "@/lib/firestoreServer/admin";
import { Timestamp } from "firebase-admin/firestore";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { IAssistantConversation } from "src/types/IAssitantConversation";

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const assistantConversationRef = db.collection("assistantConversations").doc();
    const conversationData: IAssistantConversation = {
      messages: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    await assistantConversationRef.set(conversationData);

    return res.status(200).json({
      conversationId: assistantConversationRef.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default fbAuth(handler);
