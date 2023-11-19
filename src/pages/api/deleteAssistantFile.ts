import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { openai } from "./openAI/helpers";

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { bookId } = req.body;
    const bookDoc = await db.collection("books").doc(bookId).get();
    const book: any = bookDoc.data();
    if (book.file_id) {
      bookDoc.ref.update({
        file_id: "",
        deleted: true,
      });
      await openai.files.del(book.file_id);
    }
    return res.status(200).send({
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default handler;
