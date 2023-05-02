import { db } from "@/lib/firestoreServer/admin";
import { Timestamp } from "firebase-admin/firestore";
import { NextApiRequest, NextApiResponse } from "next";
import { IAssistantConversation, IAssistantResponse, IAssitantRequestAction } from "src/types/IAssitantConversation";
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
        ? getGeneralKnowledgePrompt(conversationData)
        : payload.actionType === "ExplainMore"
        ? getExplainMorePrompt(conversationData)
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
    const assistantMessage = await processRecursiveCommands(gpt4Response.choices?.[0]?.message!, conversationData);
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
    } as IAssistantResponse);
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default handler;
