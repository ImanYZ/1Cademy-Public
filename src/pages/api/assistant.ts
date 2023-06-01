import { admin, db } from "@/lib/firestoreServer/admin";
import { Timestamp } from "firebase-admin/firestore";
import { NextApiRequest, NextApiResponse } from "next";
import { IAssistantPassageResponse } from "src/types/IAssistant";
import {
  IAssistantConversation,
  IAssistantMessage,
  IAssistantResponse,
  IAssitantRequestAction,
} from "src/types/IAssitantConversation";
import { INode } from "src/types/INode";
import { IUser } from "src/types/IUser";
import {
  ASSISTANT_SYSTEM_PROMPT,
  createTeachMePrompt,
  sendMessageToGPT4,
  processRecursiveCommands,
  loadResponseNodes,
  getGeneralKnowledgePrompt,
  getExplainMorePrompt,
  getGPT4Queries,
  getNodeResultFromCommands,
  generateNodesPrompt,
  createDirectQuestionPrompt,
  sendMessageToGPT4V2,
  parseJSONObjectResponse,
  getAssistantNodesFromTitles,
  findPassageResponse,
  updatePassageResponse,
} from "src/utils/assistant-helpers";

export type IAssistantRequestPayload = {
  actionType: IAssitantRequestAction;
  message: string;
  conversationId?: string;
  url?: string;
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
    let userData: IUser | undefined = undefined;
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

    // Course Id
    const tagId: string = userData?.uname === "1man" ? "FJfzAX7zbgQS8jU5XcEk" : "HjIukJr12fIP9DNoD9gX";

    let tagTitle: string = "";
    if (tagId) {
      const tagDoc = await db.collection("nodes").doc(tagId).get();
      if (tagDoc.exists) {
        const tag = tagDoc.data() as INode;
        tagTitle = tag.title;
      }
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

    if (payload.url && payload.actionType === "TeachContent") {
      const passageResponse = await findPassageResponse(payload.message, payload.url);
      if (passageResponse) {
        const _passageResponse = passageResponse.data() as IAssistantPassageResponse;
        const assistantMessage = _passageResponse.response!;
        return res.status(200).json({
          conversationId: assistantConversationRef.id,
          message: assistantMessage.message,
          actions: assistantMessage.actions,
          nodes: assistantMessage.nodes,
          is404: assistantMessage.is404,
          request: payload.message,
        } as IAssistantResponse);
      }
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

    let prompt: string =
      payload.actionType === "GeneralExplanation"
        ? getGeneralKnowledgePrompt(conversationData, payload.message)
        : payload.actionType === "ExplainMore"
        ? getExplainMorePrompt(conversationData, payload.message)
        : "";
    let commands: string[] = [];

    if (payload.actionType === "TeachContent" || payload.actionType === "DirectQuestion") {
      commands = await getGPT4Queries(conversationData, payload.message);
      const nodes = await getNodeResultFromCommands(commands, tagTitle, userData);
      prompt =
        payload.actionType === "TeachContent"
          ? createTeachMePrompt(payload.message, nodes)
          : createDirectQuestionPrompt(payload.message, nodes);
    }

    if (!payload.message.trim() || !prompt) {
      return res.status(200).json({
        message: "Unknown",
      });
    }

    const gpt4Response = await sendMessageToGPT4V2(
      {
        role: "user",
        content: prompt,
      },
      conversationData,
      payload.message
    );

    const assistantMessage: IAssistantMessage = {
      gptMessage: gpt4Response?.choices?.[0]?.message,
      message: "",
    };
    conversationData.messages.push(assistantMessage);

    if (payload.actionType === "TeachContent" || payload.actionType === "DirectQuestion") {
      const _message = assistantMessage.gptMessage?.content || "";
      const response: {
        response: string;
        nodes: string[];
      } = parseJSONObjectResponse(_message);

      assistantMessage.message = response?.response || assistantMessage.message;
      const nodes = await getAssistantNodesFromTitles(
        (response?.nodes || []).map(node => ({ title: node })),
        userData
      );
      assistantMessage.nodes = nodes;
    } else {
      assistantMessage.message = assistantMessage.gptMessage?.content || "";
    }

    // Saving conversation process to provide context of conversation in future
    await saveConversation(assistantConversationRef, assistantConversation, conversationData);

    // Saving cache for response of passage
    if (payload.url && payload.actionType === "TeachContent") {
      await updatePassageResponse({
        passage: payload.message.trim(),
        url: payload.url,
        queries: commands,
        response: assistantMessage,
      });
    }

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
