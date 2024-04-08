import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { sendGPTPrompt } from "src/utils/assistant-helpers";
import { saveLogs } from "./assistantTutor";
import { streamMainResponse } from "./openAI/helpers";

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { reaction, concept, conversationId, messageId } = req.body;
    const { uid, uname, fName, customClaims } = req.body?.data?.user?.userData;
    console.log({
      reaction,
    });

    const prompt =
      'I find the following concept "' +
      reaction +
      '":\n' +
      "title: " +
      concept.title +
      "\n" +
      "content: " +
      concept.content +
      '\n Do you think others also feel like this concept is "' +
      reaction +
      '"? Tell me your thoughts about it, but do not ask me any questions. Make your message very short, but encourage me to keep thinking about the course concepts.';

    console.log(prompt);
    const response: any = await streamMainResponse({
      res,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    const conversationDoc = await db.collection("tutorConversations").doc(conversationId).get();
    const conversationData: any = conversationDoc.data();

    if (conversationData) {
      const messages = conversationData.messages;
      const messageIdx = messages.findIndex((m: any) => m.mid === messageId);
      console.log(messageIdx, conversationId);
      messages[messageIdx].reactionFeedback = response;
      await conversationDoc.ref.update({
        messages,
      });
      console.log(response);
      await saveLogs({
        uname: uname || "",
        severity: "default",
        where: "assistantTutorReaction",
        action: "request feedback for reaction on concept",
        messageId,
        conversationId,
        reaction,
      });
    }
    res.end();
    return res.status(200).json({ response });
  } catch (error) {}
}

export default fbAuth(handler);
