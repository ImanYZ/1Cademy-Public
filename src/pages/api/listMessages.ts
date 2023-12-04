import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { openai } from "./openAI/helpers";

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
