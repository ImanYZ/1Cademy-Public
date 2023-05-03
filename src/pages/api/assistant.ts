import { admin, db } from "@/lib/firestoreServer/admin";
import { Timestamp } from "firebase-admin/firestore";
import { NextApiRequest, NextApiResponse } from "next";
import { IAssistantConversation, IAssistantResponse, IAssitantRequestAction } from "src/types/IAssitantConversation";
import { IUser } from "src/types/IUser";
import {
  ASSISTANT_SYSTEM_PROMPT,
  createTeachMePrompt,
  sendMessageToGPT4,
  processRecursiveCommands,
  loadResponseNodes,
  getGeneralKnowledgePrompt,
  getExplainMorePrompt,
} from "src/utils/assistant-helpers";

export type IAssistantRequestPayload = {
  actionType: IAssitantRequestAction;
  message: string;
  conversationId?: string;
  // notebookId?: string;
};

const saveConversation = async (
  conversationRef: FirebaseFirestore.DocumentReference<any>,
  conversation: FirebaseFirestore.DocumentSnapshot,
  conversationData: IAssistantConversation
) => {
  if (conversation.exists) {
    await conversationRef.update({
      messages: conversationData.messages,
      updatedAt: conversationData.updatedAt,
    });
  } else {
    await conversationRef.set(conversationData);
  }
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    // Course Id
    const tagId: string = "HjIukJr12fIP9DNoD9gX";

    let userData: IUser | null = null;
    // loading user document if authorization provided
    let token = (req.headers.authorization || req.headers.Authorization || "") as string;
    token = token.replace("Bearer ", "").trim();
    if (token) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        if (decodedToken) {
          const users = await db.collection("users").where("userId", "==", decodedToken.uid).limit(1).get();
          if (users.docs.length) {
            userData = users.docs[0].data() as IUser;
          }
        }
      } catch (e) {}
    }

    const payload = req.body as IAssistantRequestPayload;
    const assistantConversationRef = payload.conversationId
      ? db.collection("assistantConversations").doc(payload.conversationId)
      : db.collection("assistantConversations").doc();
    const conversationData: IAssistantConversation = {
      messages: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const assistantConversation = await assistantConversationRef.get();
    if (assistantConversation.exists) {
      const _assistantConversation = assistantConversation.data() as IAssistantConversation;
      conversationData.messages = _assistantConversation.messages;
      conversationData.createdAt = _assistantConversation.createdAt;
    }

    // sending knowledge graph definition
    if (!conversationData.messages.length) {
      conversationData.messages.push({
        gptMessage: {
          role: "system",
          content: ASSISTANT_SYSTEM_PROMPT,
          name: "1Cademy",
        },
      });
    }

    const prompt: string =
      payload.actionType === "TeachContent"
        ? createTeachMePrompt(payload.message)
        : payload.actionType === "DirectQuestion"
        ? payload.message
        : payload.actionType === "GeneralExplanation"
        ? getGeneralKnowledgePrompt(conversationData, payload.message)
        : payload.actionType === "ExplainMore"
        ? getExplainMorePrompt(conversationData, payload.message)
        : "";

    if (!payload.message.trim()) {
      return res.status(200).json({
        message: "Unknown",
      });
    }

    const gpt4Response = await sendMessageToGPT4(
      {
        role: "user",
        content: prompt,
      },
      conversationData,
      payload.message
    );

    // Process ChatGPT requests for Nodes Search recursively.
    const assistantMessage = await processRecursiveCommands(
      gpt4Response.choices?.[0]?.message!,
      conversationData,
      tagId,
      userData?.uname!,
      1
    );
    // Parsing JSON and removing it from final content.
    await loadResponseNodes(assistantMessage);
    // Saving conversation process to provide context of conversation in future
    await saveConversation(assistantConversationRef, assistantConversation, conversationData);

    // If was able to get information from knowledge graph
    return res.status(200).json({
      conversationId: assistantConversationRef.id,
      message: assistantMessage.message,
      actions: assistantMessage.actions,
      nodes: assistantMessage.nodes,
      is404: assistantMessage.is404,
      request: payload.message,
    } as IAssistantResponse);
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default handler;
