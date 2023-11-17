import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
const OpenAI = require("openai");

// Create a OpenAI connection
const secretKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: secretKey,
  //   OPENAI_API_ORG_ID: process.env.OPENAI_API_KEY,
});

const getThread = async (bookId: string) => {
  const bookDoc = await db.collection("books").doc(bookId).get();
  const bookData = bookDoc.data();
  return bookData;
};
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { bookId } = req.body;
    const documentData: any = await getThread(bookId);
    const threadMessages = await openai.beta.threads.messages.list(documentData.threadId);

    console.log(threadMessages.data);
    return res.status(200).send({
      messages: threadMessages.data.sort((a: any, b: any) => a.created_at - b.created_at),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default handler;
